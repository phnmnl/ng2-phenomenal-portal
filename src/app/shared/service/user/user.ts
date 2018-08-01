export class User {
  id: string;
  name: string;
  username: string;
  email: string;
  hasAcceptedTermsConditions: boolean;
  hasGalaxyAccount: boolean;
  firstAccess: number;
  lastAccess: number;
  numberOfAccesses: number;

  constructor(userInfo: any) {
    this.id = userInfo.id || userInfo.Idmetadata;
    this.name = userInfo.name;
    this.username = userInfo.username;
    this.email = userInfo.email;
    this.firstAccess = userInfo.firstAccess;
    this.lastAccess = userInfo.lastAccess;
    this.numberOfAccesses = userInfo.numberOfAccesses;
    this.hasAcceptedTermsConditions = userInfo.hasAcceptedTermsConditions || userInfo.Isaccepttermcondition === 1;
    this.hasGalaxyAccount = userInfo.hasGalaxyAccount || userInfo.Isregistergalaxy === 1;
    console.log("Created new user object", this);
  }
}
