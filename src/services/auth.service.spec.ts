import { plainToClass } from 'class-transformer'
import faker from 'faker'
import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { Unauthorized, NotFound } from 'http-errors'
import { LoginDto } from '../dtos/auths/request/login.dto'
import { AuthService } from './auth.service'
import { UsersService } from './user.service'
import { CreateUserDto } from '../dtos/users/request/create-user.dto'


describe('AuthService', ()=>{
  
  const user = plainToClass(CreateUserDto, {
    name: 'user',
    userName:'user',
    email: 'test11@example.com',
    password: 'test2022',
  })
    
  describe('login', () => {
    it('should has a sucessful session and return token', async () => {
      await UsersService.create(user)
      const data = plainToClass(LoginDto, {
        email: user.email,
        password: user.password,
      })
      const result = await AuthService.login(data)
  
      expect(result).toHaveProperty('accessToken')
    })
  
    it('should has a failed session because of password is incorrect and throw error', async () => {
      const data = plainToClass(LoginDto, {
        email: user.email,
        password: faker.internet.password(8),
      })
      await expect(AuthService.login(data)).rejects.toThrow(new Unauthorized('Password incorrect'))
    })
    
    it('should return a error if user doesnt exist', async () => {
      const data = plainToClass(LoginDto, {
        email: faker.internet.email,
        password: faker.internet.password(8),
      })
      await expect(AuthService.login(data)).rejects.toThrow(
        new Unauthorized('User doesnt exist')
      )
    })
  })
  
  describe('logout',()=>{
    it('should do the action a delete token', async()=>{
      const data = plainToClass(LoginDto, {
        email: user.email,
        password: user.password,
      })
      const token  = await AuthService.login(data)
      await expect(AuthService.logout(token)).toBeTrue()
    })
  
    it('should throw error if the token isn\'t validate',async ()=>{
      const data = plainToClass(LoginDto, {
        email: user.email,
        password: user.password,
      })
      const token  = await AuthService.login(data)
      await expect(AuthService.logout(token)).rejects.toThrow()
    })  
  })
  
})