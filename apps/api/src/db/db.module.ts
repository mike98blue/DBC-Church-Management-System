import { Global, Module } from '@nestjs/common';
import { createDb, type Database } from '@churchos/db';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE',
      useFactory: (): Database | null => {
        const url = process.env.DATABASE_URL;
        if (!url) return null;
        return createDb(url);
      },
    },
  ],
  exports: ['DATABASE'],
})
export class DbModule {}
