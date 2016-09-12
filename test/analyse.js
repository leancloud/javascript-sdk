describe('analyse', function () {
  it('send custom event', function () {
    return AV.Analyse.send({
      version: '1.8.6',
      channel: 'weixin',
      event: 'test-event-name',
      attr: {
        testa: 123,
        testb: 'abc',
      },
      duration: 6000,
    });
  });
});
