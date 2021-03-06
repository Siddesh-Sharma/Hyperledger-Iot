import { ExpressMiddleware, Middleware, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'express-jwt';
import { expressJwtSecret } from 'jwks-rsa';
import { EnvConfig } from '../config/env';

@Middleware()
export class JwtauthenticationMiddleware implements NestMiddleware {

    /**
     * Performs JWT authentication for selected routes (check the appmodule MiddlewaresConsumer to configure routes)
     *
     * @memberof JwtauthenticationMiddleware
     */
    resolve(): ExpressMiddleware {
        return (req, res, next) => {
            jwt({
                secret: expressJwtSecret({
                    cache: true,
                    rateLimit: true,
                    jwksRequestsPerMinute: 5,
                    jwksUri: `https://${EnvConfig.AUTH0_DOMAIN}/.well-known/jwks.json`
                }),
                audience: EnvConfig.AUTH0_AUDIENCE,
                issuer: `https://${EnvConfig.AUTH0_DOMAIN}/`,
                algorithm: 'RS256'
            })(req, res, this.next.bind(this, next));
        };
    }

    // This is a hack around the fact that jwt-express package throws an error which results in an internal server
    // error as output instead of unauthorized
    next(next, err) {
        if (!err) {
            return next();
        }

        next(new UnauthorizedException(err.message));
    }
}