import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ConverterService,
  Occ,
  OccConfig,
  OccEndpointsService,
  TITLE_NORMALIZER,
  User,
  UserSignUp,
  USER_NORMALIZER,
  USER_SERIALIZER,
  USER_SIGN_UP_SERIALIZER,
} from '@spartacus/core';
import { OccUserAccountAdapter } from './occ-user-account.adapter';
import {
  MockOccEndpointsService,
  mockOccModuleConfig,
} from './unit-test.helper';

const username = 'mockUsername';
const password = '1234';

const user: User = {
  customerId: username,
  displayUid: password,
};

describe('OccUserAccountAdapter', () => {
  let occUserAccountAdapter: OccUserAccountAdapter;
  let httpMock: HttpTestingController;
  let converter: ConverterService;
  let occEnpointsService: OccEndpointsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OccUserAccountAdapter,
        { provide: OccConfig, useValue: mockOccModuleConfig },
        {
          provide: OccEndpointsService,
          useClass: MockOccEndpointsService,
        },
      ],
    });

    occUserAccountAdapter = TestBed.inject(OccUserAccountAdapter);
    httpMock = TestBed.inject(HttpTestingController);
    converter = TestBed.inject(ConverterService);
    occEnpointsService = TestBed.inject(OccEndpointsService);
    spyOn(converter, 'pipeableMany').and.callThrough();
    spyOn(converter, 'pipeable').and.callThrough();
    spyOn(converter, 'convert').and.callThrough();
    spyOn(occEnpointsService, 'getUrl').and.callThrough();
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('load user details', () => {
    it('should load user details for given username and access token', () => {
      occUserAccountAdapter.load(username).subscribe((result) => {
        expect(result).toEqual(user);
      });

      const mockReq = httpMock.expectOne((req) => {
        return req.method === 'GET';
      });

      expect(occEnpointsService.getUrl).toHaveBeenCalledWith('user', {
        userId: user.customerId,
      });
      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(user);
    });

    it('should use converter', () => {
      occUserAccountAdapter.load(username).subscribe();
      httpMock
        .expectOne((req) => {
          return req.method === 'GET';
        })
        .flush(user);
      expect(converter.pipeable).toHaveBeenCalledWith(USER_NORMALIZER);
    });
  });

  describe('update user details', () => {
    it('should update user details for the given username', () => {
      const userUpdates: User = {
        title: 'mr',
      };
      occUserAccountAdapter.update(username, userUpdates).subscribe();

      const mockReq = httpMock.expectOne((req) => {
        return req.method === 'PATCH';
      });
      expect(occEnpointsService.getUrl).toHaveBeenCalledWith('user', {
        userId: user.customerId,
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      expect(mockReq.request.body).toEqual(userUpdates);
      mockReq.flush(userUpdates);
    });

    it('should use converter', () => {
      const userUpdates: User = {
        title: 'mr',
      };

      occUserAccountAdapter.update(username, userUpdates).subscribe();
      httpMock
        .expectOne((req) => {
          return req.method === 'PATCH';
        })
        .flush(userUpdates);
      expect(converter.convert).toHaveBeenCalledWith(
        userUpdates,
        USER_SERIALIZER
      );
    });
  });

  describe('resiter user', () => {
    it('should able to register a new user', () => {
      const userSignUp: UserSignUp = {
        uid: 'uid',
        password: 'password',
      };
      occUserAccountAdapter.register(userSignUp).subscribe();

      const mockReq = httpMock.expectOne((req) => {
        return req.method === 'POST';
      });
      expect(occEnpointsService.getUrl).toHaveBeenCalledWith('userRegister');

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      expect(mockReq.request.body).toEqual(userSignUp);
      mockReq.flush(userSignUp);
    });

    it('should use converter', () => {
      const userSignUp: UserSignUp = {
        uid: 'uid',
        password: 'password',
      };
      occUserAccountAdapter.register(userSignUp).subscribe();
      httpMock
        .expectOne((req) => {
          return req.method === 'POST';
        })
        .flush(userSignUp);
      expect(converter.convert).toHaveBeenCalledWith(
        userSignUp,
        USER_SIGN_UP_SERIALIZER
      );
    });
  });

  describe('resiter guest', () => {
    it('should able to register a new user from guest', () => {
      const guid = 'guid';
      const pwd = 'password';
      occUserAccountAdapter.registerGuest(guid, pwd).subscribe();

      const mockReq = httpMock.expectOne((req) => {
        return (
          req.method === 'POST' &&
          req.serializeBody() === `guid=${guid}&password=${pwd}`
        );
      });
      expect(occEnpointsService.getUrl).toHaveBeenCalledWith('userRegister');

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush({});
    });
  });

  describe('forgot password: ', () => {
    it('should request a forgot password email for userId', () => {
      const testUserId = 'test@test.com';
      occUserAccountAdapter
        .requestForgotPasswordEmail(testUserId)
        .subscribe((result) => expect(result).toEqual(''));

      const mockReq = httpMock.expectOne((req) => {
        return (
          req.method === 'POST' &&
          req.serializeBody() === `userId=${testUserId}`
        );
      });
      expect(occEnpointsService.getUrl).toHaveBeenCalledWith(
        'userForgotPassword'
      );

      expect(mockReq.cancelled).toBeFalsy();
      mockReq.flush('');
    });
  });

  describe('reset password: ', () => {
    it('should be able to reset a new password', () => {
      const token = 'test token';
      const newPassword = 'new password';

      occUserAccountAdapter
        .resetPassword(token, newPassword)
        .subscribe((result) => expect(result).toEqual(''));

      const mockReq = httpMock.expectOne((req) => {
        return req.method === 'POST';
      });

      expect(occEnpointsService.getUrl).toHaveBeenCalledWith(
        'userResetPassword'
      );
      expect(mockReq.request.headers.get('cx-use-client-token')).toBeTruthy();
      expect(mockReq.request.body).toEqual({
        token: 'test token',
        newPassword: 'new password',
      });
      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush('');
    });
  });

  describe('remove user account: ', () => {
    it('should be able to close user account', () => {
      occUserAccountAdapter
        .remove('testUserId')
        .subscribe((result) => expect(result).toEqual(''));

      const mockReq = httpMock.expectOne((req) => {
        return req.method === 'DELETE';
      });

      expect(occEnpointsService.getUrl).toHaveBeenCalledWith('user', {
        userId: 'testUserId',
      });
      expect(mockReq.cancelled).toBeFalsy();
      mockReq.flush('');
    });
  });

  describe('update email: ', () => {
    it('should be able to update the email address', () => {
      const userId = 'test@test.com';
      const currentPassword = 'Qwe123!';
      const newUserId = 'tester@sap.com';

      let result: Object;

      occUserAccountAdapter
        .updateEmail(userId, currentPassword, newUserId)
        .subscribe((value) => (result = value));

      const mockReq = httpMock.expectOne((req) => {
        return (
          req.method === 'PUT' &&
          req.serializeBody() ===
            `password=${currentPassword}&newLogin=${newUserId}`
        );
      });

      expect(
        occEnpointsService.getUrl
      ).toHaveBeenCalledWith('userUpdateLoginId', { userId });
      expect(mockReq.cancelled).toBeFalsy();

      mockReq.flush('');
      expect(result).toEqual('');
    });
  });

  describe('update password: ', () => {
    it('should update the password for userId', () => {
      const userId = 'test@test.com';
      const oldPassword = 'OldPass123!';
      const newPassword = 'NewPass456!';

      let result: Object;

      occUserAccountAdapter
        .updatePassword(userId, oldPassword, newPassword)
        .subscribe((value) => (result = value));

      const mockReq = httpMock.expectOne((req) => {
        return (
          req.method === 'PUT' &&
          req.serializeBody() === `old=${oldPassword}&new=${newPassword}`
        );
      });

      expect(
        occEnpointsService.getUrl
      ).toHaveBeenCalledWith('userUpdatePassword', { userId });

      expect(mockReq.cancelled).toBeFalsy();
      mockReq.flush('');
      expect(result).toEqual('');
    });
  });

  describe('loadTitles', () => {
    it('load return titles list', () => {
      const titlesList: Occ.TitleList = {
        titles: [
          {
            code: 'mr',
            name: 'Mr.',
          },
          {
            code: 'mrs',
            name: 'Mrs.',
          },
        ],
      };

      occUserAccountAdapter.loadTitles().subscribe((result) => {
        expect(result).toEqual(titlesList.titles);
      });

      const mockReq = httpMock.expectOne((req) => {
        return req.method === 'GET';
      });

      expect(occEnpointsService.getUrl).toHaveBeenCalledWith('titles');
      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(titlesList);
    });

    it('should use converter', () => {
      occUserAccountAdapter.loadTitles().subscribe();
      httpMock.expectOne('/titles').flush({});
      expect(converter.pipeableMany).toHaveBeenCalledWith(TITLE_NORMALIZER);
    });
  });
});