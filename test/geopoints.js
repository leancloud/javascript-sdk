var Post = AV.Object.extend('Post');
describe('Geopoints', () => {
  before(function () {
    // Make a new post
    const user = AV.User.current();

    const post = new Post();
    post.set('title', 'Post Geopoints');
    post.set('body', ' Geopoints content.');
    post.set('user', user);

    this.post = post;
  });

  it('save object with geopoints', function () {
    const point = new AV.GeoPoint({ latitude: 40.0, longitude: -30.0 });
    this.post.set('location', point);
    return this.post.save();
  });

  it('near', function () {
    const postGeoPoint = this.post.get('location');
    // Create a query for places
    const query = new AV.Query(Post);
    // Interested in locations near user.
    query.near('location', postGeoPoint);
    // Limit what could be a lot of points.
    query.limit(10);
    // Final list of objects
    return query.find();
  });
});
