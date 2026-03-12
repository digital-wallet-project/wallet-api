import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { ILogin } from 'src/shared/core/interfaces/login.interface'
import { IUserRepo } from '../../infra/repository/IUserRepo'
import { UserRepository } from '../../infra/repository/impl/UserRepository'

@Injectable()
export class AuthService {
  constructor(
    @Inject(UserRepository)
    private userRepo: IUserRepo,
    private readonly jwtService: JwtService,
  ) {}

  async login(payload: ILogin) {
    const user = await this.userRepo.findByEmail(payload.email)
    const isValid = user && await bcrypt.compare(payload.password, user.password)
    
    if (!isValid) 
      throw new UnauthorizedException('Invalid credentials')

    if (!user.isActive)
      throw new UnauthorizedException('Account is inactive')

    const jwtPayload = { sub: user.id, name: user.name, email: user.email, role: user.role }
    return { token: this.jwtService.sign(jwtPayload) }
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
  }
}