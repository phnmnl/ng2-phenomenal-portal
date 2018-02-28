export class User {
  id: string;
  name: string;
  username: string;
  email: string;
  hasAcceptedTermConditions: boolean;
  hasGalaxyAccount: boolean;

  constructor(userInfo: any) {
    this.id = userInfo.id || userInfo.Idmetadata;
    this.name = userInfo.name;
    this.username = userInfo.username;
    this.email = userInfo.email;
    this.hasAcceptedTermConditions = userInfo.hasAcceptedTermConditions || userInfo.Isaccepttermcondition === 1;
    this.hasGalaxyAccount = userInfo.hasGalaxyAccount || userInfo.Isregistergalaxy === 1;
    console.log("Created new user object", this);
  }
}
