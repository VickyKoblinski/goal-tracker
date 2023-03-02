import {
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
export class GqlAuthGuardNoValidation extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}

@Injectable()
export class GqlAuthGuard extends GqlAuthGuardNoValidation {
  constructor(@Inject(AuthService) private authService: AuthService) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  async canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const payload = ctx.getContext().req;

    const isValidated = await this.authService.hasValidatedEmail(
      payload.username,
    );
    if (!isValidated) {
      throw new UnauthorizedException('Email address has not been validated');
    }

    return super.canActivate(context);
  }
}

@Injectable()
export class LocalGqlAuthGuard extends AuthGuard('local') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    req.body = req.body.variables.loginUserInput;
    return req;
  }
}
