describe('analyse', function () {
  it('send custom event', function () {
    return AV.Analyse.send({
      version: AV.version,
      channel: 'JS 测试',
      event: 'test-event-name',
      attributes: {
        testa: 123,
        testb: 'abc',
      },
      duration: 6000,
    });
  });
});
