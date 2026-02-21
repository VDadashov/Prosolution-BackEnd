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
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../../_common/enums/role.enum';
import { normalizePagination, toPaginatedResult } from '../../_common/utils/pagination.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  /** Əgər .env-də default admin/superAdmin məlumatları varsa (email, şifrə, username) və belə istifadəçi yoxdursa, yaradır. App tərəfindən startup-da çağrılır. */
  async seedDefaultAdmins(): Promise<void> {
    const toCreate: Array<{
      email: string;
      password: string;
      username: string;
      role: UserRole;
      firstName: string;
      lastName: string;
    }> = [];

    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL?.trim();
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;
    const adminUsername = process.env.DEFAULT_ADMIN_USERNAME?.trim();
    if (adminEmail && adminPassword && adminUsername) {
      toCreate.push({
        email: adminEmail,
        password: adminPassword,
        username: adminUsername,
        role: UserRole.ADMIN,
        firstName: process.env.DEFAULT_ADMIN_FIRST_NAME?.trim() || 'Admin',
        lastName: process.env.DEFAULT_ADMIN_LAST_NAME?.trim() || 'Admin',
      });
    }

    const superEmail = process.env.DEFAULT_SUPER_ADMIN_EMAIL?.trim();
    const superPassword = process.env.DEFAULT_SUPER_ADMIN_PASSWORD;
    const superUsername = process.env.DEFAULT_SUPER_ADMIN_USERNAME?.trim();
    if (superEmail && superPassword && superUsername) {
      toCreate.push({
        email: superEmail,
        password: superPassword,
        username: superUsername,
        role: UserRole.SUPER_ADMIN,
        firstName: process.env.DEFAULT_SUPER_ADMIN_FIRST_NAME?.trim() || 'Super',
        lastName: process.env.DEFAULT_SUPER_ADMIN_LAST_NAME?.trim() || 'Admin',
      });
    }

    for (const item of toCreate) {
      const existing = await this.userRepository.findOne({ where: { email: item.email } });
      if (existing) continue;

      let username = item.username;
      let suffix = 0;
      while (await this.userRepository.findOne({ where: { username } })) {
        username = `${item.username}${++suffix}`;
      }

      const password_hash = await bcrypt.hash(item.password, 10);
      const user = this.userRepository.create({
        email: item.email,
        username,
        password_hash,
        firstName: item.firstName,
        lastName: item.lastName,
        role: item.role,
      });
      await this.userRepository.save(user);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Seed] Default ${item.role} created: ${item.email}`);
      }
    }
  }

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

    user.lastLogin = new Date();
    await this.userRepository.save(user);

    const payload = {
      username: user.username,
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);
    return { access_token: token };
  }

  /** Header-dakı token əsasında cari istifadəçinin profilini qaytarır (id, username, email, role, lastLogin). */
  async getProfile(userId: number): Promise<{ id: number; username: string; email: string; role: string; lastLogin: Date | null }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException(ErrorCode.USER_NOT_FOUND);
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin ?? null,
    };
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

  /** Cari istifadəçinin profil məlumatlarını yeniləyir (firstName, lastName, username). */
  async updateProfile(
    userId: number,
    dto: { firstName?: string; lastName?: string; username?: string },
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException(ErrorCode.USER_NOT_FOUND);
    }

    if (dto.username !== undefined && dto.username !== user.username) {
      const existing = await this.userRepository.findOne({
        where: { username: dto.username },
      });
      if (existing) {
        throw new ConflictException(ErrorCode.USER_ALREADY_EXISTS);
      }
      user.username = dto.username;
    }
    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;

    await this.userRepository.save(user);

    return this.toProfileResponse(user);
  }

  /** User obyektindən şifrə və token olmadan profil cavabı yaradır. */
  private toProfileResponse(user: User) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }

  /** İstifadəçilərin siyahısı: pagination və filter (role, search). */
  async getAll(params: {
    page?: number;
    limit?: number;
    role?: UserRole;
    search?: string;
  }) {
    const { page, limit } = normalizePagination(params);

    const qb = this.userRepository.createQueryBuilder('user');

    if (params.role) {
      qb.andWhere('user.role = :role', { role: params.role });
    }
    if (params.search?.trim()) {
      const search = `%${params.search.trim()}%`;
      qb.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.username ILIKE :search OR user.email ILIKE :search)',
        { search },
      );
    }

    qb.orderBy('user.id', 'ASC');

    const total = await qb.getCount();
    const users = await qb.skip((page - 1) * limit).take(limit).getMany();
    const data = users.map((u) => this.toProfileResponse(u));

    return toPaginatedResult(data, total, page, limit);
  }

  /** İstifadəçini id-yə görə tapır; tapılmazsa USER_NOT_FOUND. */
  async getById(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new UnauthorizedException(ErrorCode.USER_NOT_FOUND);
    return this.toProfileResponse(user);
  }

  /** İstifadəçini username-ə görə tapır; tapılmazsa USER_NOT_FOUND. */
  async getByUsername(username: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) throw new UnauthorizedException(ErrorCode.USER_NOT_FOUND);
    return this.toProfileResponse(user);
  }

  /** Şifrəni unutdum: emailə sıfırlama linki göndərir. Email yoxdursa da eyni cavab (təhlükəsizlik). */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return { message: 'If this email is registered, you will receive a password reset link.' };
    }

    const token = this.generateResetToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 saat
    user.password_reset_token = token;
    user.password_reset_expires = expires;
    await this.userRepository.save(user);

    try {
      const resetLink = this.getResetLink(token);
      await this.sendResetPasswordEmail(email, resetLink);
    } catch (err) {
      const e = err as Error;
      console.error('[ForgotPassword] Email send failed:', e?.message);
      if (process.env.NODE_ENV !== 'production') {
        console.error('[ForgotPassword] Check .env: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS');
        if (e?.stack) console.error(e.stack);
      }
    }
    return { message: 'If this email is registered, you will receive a password reset link.' };
  }

  /** Token və yeni şifrə ilə şifrəni sıfırlayır. */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string; success: boolean }> {
    const user = await this.userRepository.findOne({
      where: { password_reset_token: token },
    });
    if (!user) {
      throw new UnauthorizedException(ErrorCode.AUTH_RESET_TOKEN_INVALID);
    }
    if (!user.password_reset_expires || user.password_reset_expires < new Date()) {
      throw new UnauthorizedException(ErrorCode.AUTH_RESET_TOKEN_EXPIRED);
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.password_reset_token = null;
    user.password_reset_expires = null;
    await this.userRepository.save(user);

    return { message: 'Password has been reset successfully.', success: true };
  }

  private generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private getResetLink(token: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl.replace(/\/$/, '')}/reset-password?token=${token}`;
  }

  private async sendResetPasswordEmail(email: string, resetLink: string): Promise<void> {
    const host = process.env.EMAIL_HOST;
    const port = process.env.EMAIL_PORT;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    if (!host || !user || !pass) {
      throw new Error(
        'Email config missing. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS (and EMAIL_PORT) in .env',
      );
    }
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port || 587),
      secure: false,
      auth: { user, pass },
    });

    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f9; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <div style="background-color: #2563eb; color: #fff; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Şifrəni Sıfırla</h1>
            </div>
            <div style="padding: 40px; color: #334155; line-height: 1.6;">
                <p>Şifrə sıfırlama tələbi aldıq. Aşağıdakı düyməyə klikləyərək yeni şifrə təyin edə bilərsiniz.</p>
                <p>Bu link <strong>1 saat</strong> etibarlıdır.</p>
                <a href="${resetLink}" style="display: inline-block; padding: 12px 25px; background-color: #2563eb; color: #fff !important; text-decoration: none; border-radius: 5px; font-weight: 600; margin: 20px 0;">Şifrəni Sıfırla</a>
                <p style="color: #64748b; font-size: 14px;">Əgər siz bu tələbi göndərməmisinizsə, bu e-poçtu ignore edin.</p>
            </div>
            <div style="padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; background-color: #f8fafc;">&copy; 2026 Prosolution. Baku, Azerbaijan</div>
        </div>
    </div>
    `;

    await transporter.sendMail({
      from: user,
      to: email,
      subject: 'Prosolution — Şifrəni Sıfırla',
      html,
    });
  }
}