describe('AVError', () => {
  it('should be an Error', () => {
    try {
      throw AV.Error(-1, 'error message');
    } catch (error) {
      expect(error).to.be.an(Error);
      expect(error.stack).to.be.ok();
      expect(error.code).to.equal(-1);
      expect(error.message).to.equal('error message');
      expect(error.toString()).to.contain('error message');
    }
  });

  it('should be a constructor', () => {
    const error = new AV.Error(-1, 'error message');
    expect(error).to.be.an(AV.Error);
    expect(error).to.be.an(Error);
    expect(error.stack).to.be.ok();
    expect(error.code).to.equal(-1);
    expect(error.message).to.equal('error message');
    expect(error.toString()).to.contain('error message');
  });

  it('should be inheritable', () => {
    class UnknownError extends AV.Error {
      constructor() {
        super(-1, 'unknown error');
      }
    }
    const error = new UnknownError();
    expect(error).to.be.an(UnknownError);
    expect(error).to.be.an(AV.Error);
    expect(error).to.be.an(Error);
  });
});
