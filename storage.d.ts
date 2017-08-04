interface IteratorResult<T> {
  done: boolean;
  value: T;
}
interface AsyncIterator<T> {
  next(): Promise<IteratorResult<T>>
}

declare class EventEmitter {
  on(evt: string, listener: Function): EventEmitter;
  once(evt: string, listener: Function): EventEmitter;
  off(evt: string, listener: Function): EventEmitter;
  emit(evt: string, ...args: any[]): Boolean;
}

declare namespace AV {

    export var applicationId: string;
    export var applicationKey: string;
    export var masterKey: string;

    interface FetchOptions {
      keys?: string | string[];
      include?: string | string[];
      includeACL?: boolean;
    }

    export interface AuthOptions {
        /**
         * In Cloud Code and Node only, causes the Master Key to be used for this request.
         */
        useMasterKey?: boolean;
        sessionToken?: string;
        user?: User;
    }

    interface SMSAuthOptions extends AuthOptions {
      validateToken?: string;
    }

    interface CaptchaOptions {
      size?: number;
      width?: number;
      height?: number;
      ttl?: number;
    }

    interface FileSaveOptions extends AuthOptions {
      onprogress?: (event: {
        loaded: number,
        total: number,
        percent: number,
      }) => void;
    }

    export interface WaitOption {
        /**
         * Set to true to wait for the server to confirm success
         * before triggering an event.
         */
        wait?: boolean;
    }

    export interface SilentOption {
        /**
         * Set to true to avoid firing the event.
         */
        silent?: boolean;
    }

    export interface IBaseObject {
        toJSON(): any;
    }

    export class BaseObject implements IBaseObject {
        toJSON(): any;
    }

    /**
     * Creates a new ACL.
     * If no argument is given, the ACL has no permissions for anyone.
     * If the argument is a AV.User, the ACL will have read and write
     *   permission for only that user.
     * If the argument is any other JSON object, that object will be interpretted
     *   as a serialized ACL created with toJSON().
     * @see AV.Object#setACL
     * @class
     *
     * <p>An ACL, or Access Control List can be added to any
     * <code>AV.Object</code> to restrict access to only a subset of users
     * of your application.</p>
     */
    export class ACL extends BaseObject {

        constructor(arg1?: any);

        setPublicReadAccess(allowed: boolean): void;
        getPublicReadAccess(): boolean;

        setPublicWriteAccess(allowed: boolean): void;
        getPublicWriteAccess(): boolean;

        setReadAccess(userId: User, allowed: boolean): void;
        getReadAccess(userId: User): boolean;

        setReadAccess(userId: string, allowed: boolean): void;
        getReadAccess(userId: string): boolean;

        setRoleReadAccess(role: Role, allowed: boolean): void;
        setRoleReadAccess(role: string, allowed: boolean): void;
        getRoleReadAccess(role: Role): boolean;
        getRoleReadAccess(role: string): boolean;

        setRoleWriteAccess(role: Role, allowed: boolean): void;
        setRoleWriteAccess(role: string, allowed: boolean): void;
        getRoleWriteAccess(role: Role): boolean;
        getRoleWriteAccess(role: string): boolean;

        setWriteAccess(userId: User, allowed: boolean): void;
        setWriteAccess(userId: string, allowed: boolean): void;
        getWriteAccess(userId: User): boolean;
        getWriteAccess(userId: string): boolean;
    }


    /**
     * A AV.File is a local representation of a file that is saved to the AV
     * cloud.
     * @class
     * @param name {String} The file's name. This will be prefixed by a unique
     *     value once the file has finished saving. The file name must begin with
     *     an alphanumeric character, and consist of alphanumeric characters,
     *     periods, spaces, underscores, or dashes.
     * @param data {Array} The data for the file, as either:
     *     1. an Array of byte value Numbers, or
     *     2. an Object like { base64: "..." } with a base64-encoded String.
     *     3. a File object selected with a file upload control. (3) only works
     *        in Firefox 3.6+, Safari 6.0.2+, Chrome 7+, and IE 10+.
     *        For example:<pre>
     * var fileUploadControl = $("#profilePhotoFileUpload")[0];
     * if (fileUploadControl.files.length > 0) {
     *   var file = fileUploadControl.files[0];
     *   var name = "photo.jpg";
     *   var AVFile = new AV.File(name, file);
     *   AVFile.save().then(function() {
     *     // The file has been saved to AV.
     *   }, function(error) {
     *     // The file either could not be read, or could not be saved to AV.
     *   });
     * }</pre>
     * @param type {String} Optional Content-Type header to use for the file. If
     *     this is omitted, the content type will be inferred from the name's
     *     extension.
     */
    export class File extends BaseObject {

        constructor(name: string, data: any, type?: string);
        static withURL(name: string, url: string): File;
        static createWithoutData(objectId: string): File;

        destroy(): Promise<void>;
        fetch(fetchOptions?: FetchOptions, options?: AuthOptions): Promise<File>;
        metaData(): any;
        metaData(metaKey: string): any;
        metaData(metaKey: string, metaValue: any): any;
        name(): string;
        ownerId(): string;
        url(): string;
        save(options?: FileSaveOptions): Promise<File>;
        setACL(acl?: ACL): any;
        size(): any;
        thumbnailURL(width: number, height: number): string;
        toFullJSON(): any;
    }

    /**
     * Creates a new GeoPoint with any of the following forms:<br>
     *   <pre>
     *   new GeoPoint(otherGeoPoint)
     *   new GeoPoint(30, 30)
     *   new GeoPoint([30, 30])
     *   new GeoPoint({latitude: 30, longitude: 30})
     *   new GeoPoint()  // defaults to (0, 0)
     *   </pre>
     * @class
     *
     * <p>Represents a latitude / longitude point that may be associated
     * with a key in a AVObject or used as a reference point for geo queries.
     * This allows proximity-based queries on the key.</p>
     *
     * <p>Only one key in a class may contain a GeoPoint.</p>
     *
     * <p>Example:<pre>
     *   var point = new AV.GeoPoint(30.0, -20.0);
     *   var object = new AV.Object("PlaceObject");
     *   object.set("location", point);
     *   object.save();</pre></p>
     */
    export class GeoPoint extends BaseObject {

        latitude: number;
        longitude: number;

        constructor(arg1?: any, arg2?: any);

        static current(options?: AuthOptions): Promise<GeoPoint>;
        radiansTo(point: GeoPoint): number;
        kilometersTo(point: GeoPoint): number;
        milesTo(point: GeoPoint): number;
    }

    /**
     * A class that is used to access all of the children of a many-to-many relationship.
     * Each instance of AV.Relation is associated with a particular parent object and key.
     */
    export class Relation extends BaseObject {

        parent: Object;
        key: string;
        targetClassName: string;

        constructor(parent?: Object, key?: string);
        static reverseQuery(parentClass: string, relationKey: string, child: Object): Query;

        //Adds a AV.Object or an array of AV.Objects to the relation.
        add(object: Object): void;

        // Returns a AV.Query that is limited to objects in this relation.
        query(): Query;

        // Removes a AV.Object or an array of AV.Objects from this relation.
        remove(object: Object): void;
    }

    /**
     * Creates a new model with defined attributes. A client id (cid) is
     * automatically generated and assigned for you.
     *
     * <p>You won't normally call this method directly.  It is recommended that
     * you use a subclass of <code>AV.Object</code> instead, created by calling
     * <code>extend</code>.</p>
     *
     * <p>However, if you don't want to use a subclass, or aren't sure which
     * subclass is appropriate, you can use this form:<pre>
     *     var object = new AV.Object("ClassName");
     * </pre>
     * That is basically equivalent to:<pre>
     *     var MyClass = AV.Object.extend("ClassName");
     *     var object = new MyClass();
     * </pre></p>
     *
     * @param {Object} attributes The initial set of data to store in the object.
     * @param {Object} options A set of Backbone-like options for creating the
     *     object.  The only option currently supported is "collection".
     * @see AV.Object.extend
     *
     * @class
     *
     * <p>The fundamental unit of AV data, which implements the Backbone Model
     * interface.</p>
     */
    export class Object extends BaseObject {

        id: any;
        createdAt: any;
        updatedAt: any;
        attributes: any;
        changed: boolean;
        className: string;
        query: Query;

        constructor(className?: string, options?: any);
        constructor(attributes?: string[], options?: any);
        static createWithoutData(className: string, objectId: string): Object;
        static extend(className: string, protoProps?: any, classProps?: any): any;
        static fetchAll<T>(list: Object[], options?: AuthOptions): Promise<T>;
        static destroyAll<T>(list: Object[], options?: Object.DestroyAllOptions): Promise<T>;
        static saveAll<T>(list: Object[], options?: Object.SaveAllOptions): Promise<T>;
        static register(klass: Function, name?: string): void;

        initialize(): void;
        add(attributeName: string, item: any): Object;
        addUnique(attributeName: string, item: any): any;
        change(options: any): Object;
        changedAttributes(diff: any): boolean;
        clear(options: any): any;
        clone(): Object;
        destroy<T>(options?: Object.DestroyOptions): Promise<T>;
        dirty(attr: String): boolean;
        escape(attr: string): string;
        fetch<T>(fetchOptions?: FetchOptions, options?: AuthOptions): Promise<T>;
        fetchWhenSave(enable: boolean): any;
        get(attr: string): any;
        getACL(): ACL;
        has(attr: string): boolean;
        hasChanged(attr: string): boolean;
        increment(attr: string, amount?: number): any;
        isValid(): boolean;
        op(attr: string): any;
        previous(attr: string): any;
        previousAttributes(): any;
        relation(attr: string): Relation;
        remove(attr: string, item: any): any;
        save<T>(attrs?: object | null, options?: Object.SaveOptions): Promise<T>;
        save<T>(key: string, value: any, options?: Object.SaveOptions): Promise<T>;
        set(key: string, value: any, options?: Object.SetOptions): boolean;
        setACL(acl: ACL, options?: Object.SetOptions): boolean;
        unset(attr: string, options?: Object.SetOptions): any;
        validate(attrs: any): any;
        toFullJSON(): any;
    }

    export namespace Object {
        interface DestroyOptions extends AuthOptions, WaitOption { }

        interface DestroyAllOptions extends AuthOptions { }

        interface SaveOptions extends AuthOptions, SilentOption, WaitOption {
          fetchWhenSave?: boolean,
          where?: Query,
        }

        interface SaveAllOptions extends AuthOptions { }

        interface SetOptions extends SilentOption { }
    }

    /**
     * Every AV application installed on a device registered for
     * push notifications has an associated Installation object.
     */
    export class Installation extends Object {

        badge: any;
        channels: string[];
        timeZone: any;
        deviceType: string;
        pushType: string;
        installationId: string;
        deviceToken: string;
        channelUris: string;
        appName: string;
        appVersion: string;
        AVVersion: string;
        appIdentifier: string;

    }

    /**
     * @class
     *
     * <p>AV.Events is a fork of Backbone's Events module, provided for your
     * convenience.</p>
     *
     * <p>A module that can be mixed in to any object in order to provide
     * it with custom events. You may bind callback functions to an event
     * with `on`, or remove these functions with `off`.
     * Triggering an event fires all callbacks in the order that `on` was
     * called.
     *
     * <pre>
     *     var object = {};
     *     _.extend(object, AV.Events);
     *     object.on('expand', function(){ alert('expanded'); });
     *     object.trigger('expand');</pre></p>
     *
     * <p>For more information, see the
     * <a href="http://documentcloud.github.com/backbone/#Events">Backbone
     * documentation</a>.</p>
     */
    export class Events {

        static off(events: string[], callback?: Function, context?: any): Events;
        static on(events: string[], callback?: Function, context?: any): Events;
        static trigger(events: string[]): Events;
        static bind(): Events;
        static unbind(): Events;

        on(eventName: string, callback?: Function, context?: any): Events;
        off(eventName?: string, callback?: Function, context?: any): Events;
        trigger(eventName: string, ...args: any[]): Events;
        bind(eventName: string, callback: Function, context?: any): Events;
        unbind(eventName?: string, callback?: Function, context?: any): Events;

    }

    /**
     * Creates a new AV AV.Query for the given AV.Object subclass.
     * @param objectClass -
     *   An instance of a subclass of AV.Object, or a AV className string.
     * @class
     *
     * <p>AV.Query defines a query that is used to fetch AV.Objects. The
     * most common use case is finding all objects that match a query through the
     * <code>find</code> method. For example, this sample code fetches all objects
     * of class <code>MyClass</code>. It calls a different function depending on
     * whether the fetch succeeded or not.
     *
     * <pre>
     * var query = new AV.Query(MyClass);
     * query.find({
     *   success: function(results) {
     *     // results is an array of AV.Object.
     *   },
     *
     *   error: function(error) {
     *     // error is an instance of AV.Error.
     *   }
     * });</pre></p>
     *
     * <p>A AV.Query can also be used to retrieve a single object whose id is
     * known, through the get method. For example, this sample code fetches an
     * object of class <code>MyClass</code> and id <code>myId</code>. It calls a
     * different function depending on whether the fetch succeeded or not.
     *
     * <pre>
     * var query = new AV.Query(MyClass);
     * query.get(myId, {
     *   success: function(object) {
     *     // object is an instance of AV.Object.
     *   },
     *
     *   error: function(object, error) {
     *     // error is an instance of AV.Error.
     *   }
     * });</pre></p>
     *
     * <p>A AV.Query can also be used to count the number of objects that match
     * the query without retrieving all of those objects. For example, this
     * sample code counts the number of objects of the class <code>MyClass</code>
     * <pre>
     * var query = new AV.Query(MyClass);
     * query.count({
     *   success: function(number) {
     *     // There are number instances of MyClass.
     *   },
     *
     *   error: function(error) {
     *     // error is an instance of AV.Error.
     *   }
     * });</pre></p>
     */
    export class Query extends BaseObject {

        className: string;

        constructor(objectClass: any);

        static or(...var_args: Query[]): Query;
        static and(...var_args: Query[]): Query;
        static doCloudQuery<T>(cql: string, pvalues?: any, options?: Query.FindOptions): Promise<T>;

        addAscending(key: string): Query;
        addAscending(key: string[]): Query;
        addDescending(key: string): Query;
        addDescending(key: string[]): Query;
        ascending(key: string): Query;
        ascending(key: string[]): Query;
        containedIn(key: string, values: any[]): Query;
        contains(key: string, substring: string): Query;
        containsAll(key: string, values: any[]): Query;
        count<T>(options?: Query.CountOptions): Promise<T>;
        descending(key: string): Query;
        descending(key: string[]): Query;
        doesNotExist(key: string): Query;
        doesNotMatchKeyInQuery(key: string, queryKey: string, query: Query): Query;
        doesNotMatchQuery(key: string, query: Query): Query;
        each<T>(callback: Function, options?: AuthOptions): Promise<T>;
        endsWith(key: string, suffix: string): Query;
        equalTo(key: string, value: any): Query;
        exists(key: string): Query;
        find<T>(options?: Query.FindOptions): Promise<T>;
        first<T>(options?: Query.FirstOptions): Promise<T>;
        get<T>(objectId: string, options?: Query.GetOptions): Promise<T>;
        greaterThan(key: string, value: any): Query;
        greaterThanOrEqualTo(key: string, value: any): Query;
        include(key: string): Query;
        include(keys: string[]): Query;
        includeACL(value?: boolean): Query;
        lessThan(key: string, value: any): Query;
        lessThanOrEqualTo(key: string, value: any): Query;
        limit(n: number): Query;
        matches(key: string, regex: RegExp, modifiers?: any): Query;
        matchesKeyInQuery(key: string, queryKey: string, query: Query): Query;
        matchesQuery(key: string, query: Query): Query;
        near(key: string, point: GeoPoint): Query;
        notContainedIn(key: string, values: any[]): Query;
        notEqualTo(key: string, value: any): Query;
        select(...keys: string[]): Query;
        skip(n: number): Query;
        startsWith(key: string, prefix: string): Query;
        withinGeoBox(key: string, southwest: GeoPoint, northeast: GeoPoint): Query;
        withinKilometers(key: string, point: GeoPoint, maxDistance: number): Query;
        withinMiles(key: string, point: GeoPoint, maxDistance: number): Query;
        withinRadians(key: string, point: GeoPoint, maxDistance: number): Query;
        scan<T>(options?:{ orderedBy?: string, batchSize?: number }, authOptions?: AuthOptions): AsyncIterator<T>;
        subscribe(options?:{ subscriptionId?: string }): Promise<LiveQuery>;
    }

    class LiveQuery extends EventEmitter {
      unsubscribe(): Promise<void>;
    }

    export namespace Query {
        interface CountOptions extends AuthOptions { }
        interface FindOptions extends AuthOptions { }
        interface FirstOptions extends AuthOptions { }
        interface GetOptions extends AuthOptions { }
    }

    class FriendShipQuery extends Query {}

    /**
     * Represents a Role on the AV server. Roles represent groupings of
     * Users for the purposes of granting permissions (e.g. specifying an ACL
     * for an Object). Roles are specified by their sets of child users and
     * child roles, all of which are granted any permissions that the parent
     * role has.
     *
     * <p>Roles must have a name (which cannot be changed after creation of the
     * role), and must specify an ACL.</p>
     * @class
     * A AV.Role is a local representation of a role persisted to the AV
     * cloud.
     */
    export class Role extends Object {

        constructor(name: string, acl: ACL);

        getRoles(): Relation;
        getUsers(): Relation;
        getName(): string;
        setName(name: string): Role;
    }

    /**
     * @class
     *
     * <p>A AV.User object is a local representation of a user persisted to the
     * AV cloud. This class is a subclass of a AV.Object, and retains the
     * same functionality of a AV.Object, but also extends it with various
     * user specific methods, like authentication, signing up, and validation of
     * uniqueness.</p>
     */
    export class User extends Object {

        static current(): User;
        static signUp(username: string, password: string, attrs: any, options?: AuthOptions): Promise<User>;
        static logIn(username: string, password: string, options?: AuthOptions): Promise<User>;
        static logOut(): Promise<User>;
        static become(sessionToken: string, options?: AuthOptions): Promise<User>;

        static loginWithWeapp(): Promise<User>;
        static logInWithMobilePhone(mobilePhone: string, password: string, options?: AuthOptions): Promise<User>;
        static logInWithMobilePhoneSmsCode(mobilePhone: string, smsCode: string, options?: AuthOptions): Promise<User>;
        static signUpOrlogInWithAuthData(data: any, platform: string, options?: AuthOptions): Promise<User>;
        static signUpOrlogInWithMobilePhone(mobilePhoneNumber: string, smsCode: string, attributes?: any, options?: AuthOptions): Promise<User>;
        static requestEmailVerify(email: string, options?: AuthOptions): Promise<User>;
        static requestLoginSmsCode(mobilePhoneNumber: string, options?: SMSAuthOptions): Promise<void>;
        static requestMobilePhoneVerify(mobilePhoneNumber: string, options?: SMSAuthOptions): Promise<void>;
        static requestPasswordReset(email: string, options?: AuthOptions): Promise<User>;
        static requestPasswordResetBySmsCode(mobilePhoneNumber: string, options?: SMSAuthOptions): Promise<void>;
        static resetPasswordBySmsCode(code: string, password: string, options?: AuthOptions): Promise<User>;
        static verifyMobilePhone(code: string, options?: AuthOptions): Promise<User>;

        static followerQuery(userObjectId: string): FriendShipQuery;
        static followeeQuery(userObjectId: string): FriendShipQuery;

        signUp(attrs?: any, options?: AuthOptions): Promise<User>;
        logIn(options?: AuthOptions): Promise<User>;
        linkWithWeapp(): Promise<User>;
        isAuthenticated(): Promise<boolean>;
        isCurrent(): boolean;


        getEmail(): string;
        setEmail(email: string, options?: AuthOptions): boolean;

        setMobilePhoneNumber(mobilePhoneNumber: string, options?: AuthOptions): boolean;
        getMobilePhoneNumber(): string;

        getUsername(): string;
        setUsername(username: string, options?: AuthOptions): boolean;

        setPassword(password: string, options?: AuthOptions): boolean;
        getSessionToken(): string;
        refreshSessionToken(options?: AuthOptions): Promise<User>;

        getRoles(options?: AuthOptions): Promise<Role>;

        follow(user: User|string, authOptions?: AuthOptions): Promise<void>;
        follow(options: { user: User|string, attributes?: Object}, authOptions?: AuthOptions): Promise<void>;
        unfollow(user: User|string, authOptions?: AuthOptions): Promise<void>;
        unfollow(options: { user: User|string }, authOptions?: AuthOptions): Promise<void>;
        followerQuery(): FriendShipQuery;
        followeeQuery(): FriendShipQuery;
  }

    export class Captcha {
      url: string;
      captchaToken: string;
      validateToken: string;

      static request(options?: CaptchaOptions, authOptions?: AuthOptions): Promise<Captcha>;

      refresh(): Promise<string>;
      verify(code: string): Promise<string>;
      bind(elements?: {
        textInput?: string|HTMLInputElement,
        image?: string|HTMLImageElement,
        verifyButton?: string|HTMLElement,
      }, callbacks?: {
        success?: (validateToken: string) => any,
        error?: (error: Error) => any,
      }): void;
      unbind(): void;
    }

    /**
     * @class AV.Conversation
     * <p>An AV.Conversation is a local representation of a LeanCloud realtime's
     * conversation. This class is a subclass of AV.Object, and retains the
     * same functionality of an AV.Object, but also extends it with various
     * conversation specific methods, like get members, creators of this conversation.
     * </p>
     *
     * @param {String} name The name of the Role to create.
     * @param {Boolean} [options.isSystem] Set this conversation as system conversation.
     * @param {Boolean} [options.isTransient] Set this conversation as transient conversation.
     */
    export class Conversation extends Object {
      constructor(name: string, options?: { isSytem?: boolean, isTransient?: boolean });
      getCreator(): string;
      getLastMessageAt(): Date;
      getMembers(): string[];
      addMember(member: string): Conversation;
      getMutedMembers(): string[];
      getName(): string;
      isTransient(): boolean;
      isSystem(): boolean;
      send(fromClient: string, message: string|object, options?: { transient?: boolean, pushData?: object, toClients?: string[] }, authOptions?: AuthOptions): Promise<void>;
      broadcast(fromClient: string, message: string|object, options?: { pushData?: object, validTill?: number|Date }, authOptions?: AuthOptions): Promise<void>;
    }

    export class Error {

        code: ErrorCode;
        message: string;

        constructor(code: ErrorCode, message: string);

    }

    export enum ErrorCode {

        OTHER_CAUSE = -1,
        INTERNAL_SERVER_ERROR = 1,
        CONNECTION_FAILED = 100,
        OBJECT_NOT_FOUND = 101,
        INVALID_QUERY = 102,
        INVALID_CLASS_NAME = 103,
        MISSING_OBJECT_ID = 104,
        INVALID_KEY_NAME = 105,
        INVALID_POINTER = 106,
        INVALID_JSON = 107,
        COMMAND_UNAVAILABLE = 108,
        NOT_INITIALIZED = 109,
        INCORRECT_TYPE = 111,
        INVALID_CHANNEL_NAME = 112,
        PUSH_MISCONFIGURED = 115,
        OBJECT_TOO_LARGE = 116,
        OPERATION_FORBIDDEN = 119,
        CACHE_MISS = 120,
        INVALID_NESTED_KEY = 121,
        INVALID_FILE_NAME = 122,
        INVALID_ACL = 123,
        TIMEOUT = 124,
        INVALID_EMAIL_ADDRESS = 125,
        MISSING_CONTENT_TYPE = 126,
        MISSING_CONTENT_LENGTH = 127,
        INVALID_CONTENT_LENGTH = 128,
        FILE_TOO_LARGE = 129,
        FILE_SAVE_ERROR = 130,
        DUPLICATE_VALUE = 137,
        INVALID_ROLE_NAME = 139,
        EXCEEDED_QUOTA = 140,
        SCRIPT_FAILED = 141,
        VALIDATION_ERROR = 142,
        INVALID_IMAGE_DATA = 150,
        UNSAVED_FILE_ERROR = 151,
        INVALID_PUSH_TIME_ERROR = 152,
        FILE_DELETE_ERROR = 153,
        REQUEST_LIMIT_EXCEEDED = 155,
        INVALID_EVENT_NAME = 160,
        USERNAME_MISSING = 200,
        PASSWORD_MISSING = 201,
        USERNAME_TAKEN = 202,
        EMAIL_TAKEN = 203,
        EMAIL_MISSING = 204,
        EMAIL_NOT_FOUND = 205,
        SESSION_MISSING = 206,
        MUST_CREATE_USER_THROUGH_SIGNUP = 207,
        ACCOUNT_ALREADY_LINKED = 208,
        INVALID_SESSION_TOKEN = 209,
        LINKED_ID_MISSING = 250,
        INVALID_LINKED_SESSION = 251,
        UNSUPPORTED_SERVICE = 252,
        AGGREGATE_ERROR = 600,
        FILE_READ_ERROR = 601,
        X_DOMAIN_REQUEST = 602
    }

    /**
     * @class
     * A AV.Op is an atomic operation that can be applied to a field in a
     * AV.Object. For example, calling <code>object.set("foo", "bar")</code>
     * is an example of a AV.Op.Set. Calling <code>object.unset("foo")</code>
     * is a AV.Op.Unset. These operations are stored in a AV.Object and
     * sent to the server as part of <code>object.save()</code> operations.
     * Instances of AV.Op should be immutable.
     *
     * You should not create subclasses of AV.Op or instantiate AV.Op
     * directly.
     */
   export namespace Op {

        interface BaseOperation extends IBaseObject {
            objects(): any[];
        }

        interface Add extends BaseOperation {
        }

        interface AddUnique extends BaseOperation {
        }

        interface Increment extends IBaseObject {
            amount: number;
        }

        interface Relation extends IBaseObject {
            added(): Object[];
            removed: Object[];
        }

        interface Set extends IBaseObject {
            value(): any;
        }

        interface Unset extends IBaseObject {
        }

    }

    /**
     * Contains functions to deal with Push in AV
     * @name AV.Push
     * @namespace
     */
    export namespace Push {
        function send<T>(data: PushData, options?: AuthOptions): Promise<T>;

        interface PushData {
            channels?: string[];
            push_time?: Date;
            expiration_time?: Date;
            expiration_interval?: number;
            where?: Query;
            data?: any;
            alert?: string;
            badge?: string;
            sound?: string;
            title?: string;
        }

    }

    export namespace Cloud {
        function run(name: string, data?: any, options?: AuthOptions): Promise<any>;
        function requestSmsCode(data: string|{ mobilePhoneNumber: string, template?: string, sign?: string }, options?: SMSAuthOptions): Promise<void>;
        function verifySmsCode(code: string, phone: string): Promise<void>;
        function requestCaptcha(options?: CaptchaOptions, authOptions?: AuthOptions): Promise<Captcha>;
        function verifyCaptcha(code: string, captchaToken: string): Promise<void>;
    }

    interface ServerURLs {
      api?: string,
      engine?: string,
      stats?: string,
      push?: string,
    }

    export function init(options: {
      appId: string,
      appKey: string,
      masterKey?: string,
      region?: string,
      production?: boolean,
      serverURLs?: string|ServerURLs,
      disableCurrentUser?: boolean,
    }): void;
    export function setServerURLs(urls: string|ServerURLs): void;
    export function setProduction(production: boolean): void;
    export function parseJSON(json: any): Object|File|any;
    export function request(options: {
      method: string,
      path: string,
      query?: object,
      data?: object,
      authOption?: AuthOptions,
      service?: string,
      version?: string,
    }): Promise<any>;
}
export = AV;
