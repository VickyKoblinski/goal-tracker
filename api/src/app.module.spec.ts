import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import * as SendGrid from '@sendgrid/mail';

describe('AppModule', () => {
  let appModule: AppModule;

  beforeEach(async () => {
    jest.spyOn(SendGrid, 'setApiKey').mockImplementation(() => {
      // NOOP
    });
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    appModule = moduleRef.get<AppModule>(AppModule);
  });

  it('should be defined', () => {
    expect(appModule).toBeDefined();
  });
});
