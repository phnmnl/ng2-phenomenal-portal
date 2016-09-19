import { Ng2PhenomenalPortalPage } from './app.po';

describe('ng2-phenomenal-portal App', function() {
  let page: Ng2PhenomenalPortalPage;

  beforeEach(() => {
    page = new Ng2PhenomenalPortalPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
