import { Injectable } from '@nestjs/common';
import {
  ConflictException,
  UnauthorizedException,
} from '../../_common/exceptions';
import { ErrorCode } from '../../_common/constants/error-codes';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  async register(email: string) {
    const existing = await this.userRepository.findOne({
      where: [{ email }, { username: email.split('@')[0] }],
    });
    if (existing) {
      throw new ConflictException(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
    }

    const username = email.split('@')[0];
    const password = this.generatePassword();
    const password_hash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      username,
      password_hash,
      firstName: 'User',
      lastName: 'User',
    });
    await this.userRepository.save(user);
    try {
      await this.sendRegistrationEmail(email, username, password);
    } catch (err) {
      // İstifadəçi yaradılıb; email xətası loglanır, amma 201 qaytarırıq
      console.error('Registration email failed:', (err as Error)?.message);
    }
    return { message: 'User created, credentials sent to email' };
  }

  private async sendRegistrationEmail(email: string, username: string, password: string) {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f9; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <div style="background-color: #2563eb; color: #fff; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">Xoş Gəlmisiniz!</h1>
            </div>
            <div style="padding: 40px; color: #334155; line-height: 1.6;">
                <p>Hörmətli istifadəçi,</p>
                <p><strong>Prosolution</strong> platformasında qeydiyyatınız uğurla tamamlandı. Hesabınıza daxil olmaq üçün tələb olunan məlumatlar aşağıdadır:</p>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 25px 0;">
                    <div style="margin-bottom: 10px; font-size: 16px;"><strong>İstifadəçi adı:</strong> <span>${username}</span></div>
                    <div style="margin-bottom: 10px; font-size: 16px;"><strong>Müvəqqəti şifrə:</strong> <span style="font-family: 'Courier New', Courier, monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${password}</span></div>
                </div>
                <p style="color: #e11d48; font-size: 14px; margin-top: 15px; font-weight: 500;">⚠️ Təhlükəsizlik qaydalarına əsasən, ilk girişdən sonra şifrənizi dəyişməyiniz mütləqdir.</p>
                <a href="#" style="display: inline-block; padding: 12px 25px; background-color: #2563eb; color: #fff !important; text-decoration: none; border-radius: 5px; font-weight: 600; margin-top: 20px;">Sistemə Daxil Ol</a>
                <p style="margin-top: 30px;">Hər hansı sualınız yaranarsa, dəstək komandamızla əlaqə saxlaya bilərsiniz.</p>
            </div>
            <div style="padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; background-color: #f8fafc;">&copy; 2026 Prosolution. Bütün hüquqlar qorunur.<br>Baku, Azerbaijan</div>
        </div>
    </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Prosolution Qeydiyyat Məlumatları',
      html,
    });
  }

  private generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const { usernameOrEmail, password } = loginDto;
    const user = await this.userRepository.findOne({
      where: [
        { username: usernameOrEmail },
        { email: usernameOrEmail },
      ],
    });
    if (!user) throw new UnauthorizedException(ErrorCode.AUTH_INVALID_CREDENTIALS);
    if (!user.password_hash) throw new UnauthorizedException(ErrorCode.AUTH_INVALID_CREDENTIALS);
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new UnauthorizedException(ErrorCode.AUTH_INVALID_CREDENTIALS);

    const payload = {
      username: user.username,
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);
    return { access_token: token };
  }

  async changePassword(userId: number, body: { oldPassword: string; newPassword: string }) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException(ErrorCode.USER_NOT_FOUND);
    }

    if (!user.password_hash) {
      throw new UnauthorizedException(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }

    const isMatch = await bcrypt.compare(body.oldPassword, user.password_hash);

    if (!isMatch) {
      throw new UnauthorizedException(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }

    user.password_hash = await bcrypt.hash(body.newPassword, 10);

    await this.userRepository.save(user);

    return {
      message: 'Password changed successfully',
      success: true,
    };
  }
}