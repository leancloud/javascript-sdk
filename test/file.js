describe("files", function() {
  describe("Saving base64", function(){

    it("should be saved", function(done){
      var base64 = "d29ya2luZyBhdCBhdm9zY2xvdWQgaXMgZ3JlYXQh";
      var file = new AV.File("myfile.txt", { base64: base64 });
      file.metaData('format', 'txt file');
      file.setACL(new AV.ACL());
      file.save().then(function(){
        // console.log(file.url());
        // console.log(file.id);
        expect(file.ownerId()).to.be.ok();
        expect(file.id).to.be.ok();
        expect(file.metaData('format')).to.be('txt file');
        file.destroy().then(function(){
          done();
        }, function(error){
          done(error);
        });
      }, function(error){
        done(error);
      });
    });
  });

  describe("Saving base64 image", function(){

    it("should be saved", function(done){
      var base64 = 'R0lGODlhGAAYAPf/AFuktf7bPEeVu8G9kHxvRfTYmEKe0Ku5cluZqdLDqv/9w//1dHOhm6aoZpvL5Y19WER+l//4mG2Wpf/sYoipieq8W/K1ItarcGBYPZeNUPXLX+bbzsnj88G+s/zRM+mrJ0CGp+3XtP79+vbObbeFS1qlxcKoOzuMtoW1moikfJuWZVqDknOVh8K4XoOppUmh06mxatfOxmylomWLmD2d06zAeYSKc//8ufa+MjmWyVd6fP/1hmmcmrPZ71KbtGqkt7LNt3CspP/+/v3MK4VwN/q+HrqXNuvm4qaYTO3jcfzDIv7jSNGykf7dQXl1Yuy1N/z59HO54YeddPXCMnOReqS0ijSZ0//pU//lSXOWlfzVPLN3K3GLdpvAtVep2P/vXvrKM//+/IyzuuulF0+gxf/hRq3FgIa7poKrkfOtFpiMa//QLYiwwqrLmsSLOZmVhonE5XGwqqKsdv/lTczh12mryLaxo/Xz8f/mUtXq9Za3rP/wb4ivrvXAPPa1Ga3MjP/+0oCZhPn5+DSa1Jejc//qWZuBM2az33yAbXi0wzOY0nOMh1pmZ//0fPvGLNjQx2OGhZ7CnGdfSkqEmyKR0e/t6XGzsMHe7/ayFKtkD9q8XsiDIrPR0ExeYv/uW0OOtOCmK1KOpV9HKun0+sGuRJeqil43F5KZcJO3isXTwPnGNbawkXNoQP7EIIKNgr+kPIWWkmGt2HOhtPfIT01rccK0T7urh6GciqO4lF2TnPTBLPv27ZnDzJm3uHi42P/rXm+rx3JVL62nmf7IJV59eGiutfnAI63IhoJSI8fEupC8nKChZPX6/bqbUOfi3uKZFk2Rr3FJJGJva5WtpafFiafBgU5yephOEl0jAIczAPvop/39/Pztzv/XN9yhM11/ffi3G3hBGNecON+tT+G9jZCMfb+WZuKoL//jTfe7HtOhUcGgMoR/a9CdUeCbKk1la2OAds2ACdqSH6VaI93Db8StgTib0/j8/mqQkpqtkTWXzrnQpNPc3////zKZ1AAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpDNTc1QkFGRkI2QzVFMTExOUFFOUZDNDg5RkU1OEU3MCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpERDg2RUU1M0Q3OTExMUUxQjUzMUM1MEJBNjZEN0RBOSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpERDg2RUU1MkQ3OTExMUUxQjUzMUM1MEJBNjZEN0RBOSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkM3NzVCQUZGQjZDNUUxMTE5QUU5RkM0ODlGRTU4RTcwIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkM1NzVCQUZGQjZDNUUxMTE5QUU5RkM0ODlGRTU4RTcwIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Af/+/fz7+vn49/b19PPy8fDv7u3s6+rp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8+PTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQAAIfkEBQoA/wAsAAAAABgAGAAACP8A+wkcSLCgwYMGhYRRKEQIwoNCtGmYhaPPrBEFuDns5+SNoITa+oDREqCkBzBTNIQQIaTjR4JhNKgKsASLTSxlAnhw9KSCCJcEhchccsXTl6OeriwJMKSIhQpOyr3sh6Gq1apJkrBidbVq1JcY1KhRwW7rVXbs1BAgEIwIEQxSBWJIYIRUrRbBoolC0mDVg2imTJhYZwgDu0pyE7yy2wKZqQ4DIjtOJpiwYWeJF99FFs5U5AGcAw8u7CSGQwy2NLcwxfoza9GWS59Wo7rFAxVVVTxoUYvUYK6bHjkUhsFQhuPHJYkShQF5BkMEMGzZZNpfLERdq57hkB3Dg0u5Xhwq8seBwyArVsj7I29l0Pr1HNSTp/G+vv37+PPr38+/v///AAYo4IAE2hcQACH5BAUAAP8ALAAAAgAYABYAAAj/AP8JHEiwYMF+CA0qXIiw38KHBIUkhAhRxMR//QqoWnKto6YFIDV1vDbEwrkLFgX2C/OkyTVNMK9FmPkyphIL40IIUVlgypIrC+Zlw3ZDwQ2h2JZ0G2bsw4WBYSpoWfJlwTVs2wBpvbptToA1rfy4OSJQxActWKpeG6oAkIK12LyCxbTpkcAw59BWxcb3hl++2NB9bUXX7j8RoNAW2tNox8yZO/b8WvJVCSaCIrx5KIPnC+MdoBvtmXClzOA0A/uJGNcnwM8Je2LHnlBoTpNuQ4qMcfNIoogCTzwE4Fzo14RfhfDMMQ0WnLwLGyT22yBOl/AmZeYoX94kgIdh4MZshElwpKEIcud0DfHQLUCT7t26rcmdJpO5DXcaCoGiDpQFY46s58F8TKWTRjwkPFJeQ/0IsUs77nxgQTrGZFNEEX6k8cwWJMTgDIP6QcGEG/KAMsaJYzwTzxZMPPIhiAxCkUA9JGyRSSYcmhNDdDDCuM0dR2ywQQyPeLhgjz0KoeSSSPYTEAAh+QQFAAD/ACwAABYAGAACAAAIKgDvjfpH8B+zUZUKFuTHb2BBZswoSczDwQElf/7s9RjFYZREiR0vXfQXEAAh+QQFAAD/ACwAAAgAGAAQAAAIVwD/CRz4b8GNGwIVKFxCsKHDf9ewEYz4sOI/bNsIYrTIsaPHjyBDihxJsqTJkyhTqqzY4xIHB5QoOeBwyQtMNjGSyZzJIYrMPP78OQgaVGDQoUSTFv0XEAAh+QQFCgD/ACwAAAgAGAAQAAAIXwD/CRwocAHBCAYJKly44AaggQoizFlIsaACBRAVTKzIsaPHjyBDihxJsqTJkyhTpoQTxYG/l4fY/AiVw0GOGbkQvPTiwEEsl/5c/ns5yJ69QUNfKn0J9KVAfxWhegwIACH5BAUAAP8ALAMACAAPAA8AAAgzAP8J/HctG7aBBQ8OFHgN2zaEDhcyNIiQosSLGDNq3Mixo8ePIEOK1OigowN/F1EuLBkQACH5BAUAAP8ALAAAFAAYAAMAAAgwAOE4iOXFgT8HCAIt44HAIAIb7GS9cODAyyGDB/1p9DfIipWNIDNqHIQxpMmTIAMCACH5BAUAAP8ALAAAEwAYAAMAAAgvAA8d8kfDwRsePBj482cNDRoH/gSEQhArlj+IDiD6G7Tx4sKPID9qDEmyJEiOAQEAIfkEBQAA/wAsAAAAAAEAAQAACAQA/wUEACH5BAUAAP8ALAAACAAYAA4AAAhvAP8JHPhvwbVs2AQqOJiQoEOCBrFtEwjomsSHGAsyVLgxY8aGA0F6HEmypMmTKFOqXGnSQRQaURAg8AeAjD8HqFAFoeFDBg8HAvzFcuBgkIN//pImJfpPkZWk/xxYeervnz0HUJFqrUqSK8uBVQMCACH5BAUKAP8ALAAAEQAYAAMAAAg5AB1wgFOChz9/BoJwqIYCBQcyZAzQYMBBAq8oHDgc3Ogvo79B9gzYsxJSY8dBNAxwXHlQkRWWKwMCACH5BAUAAP8ALAAABAAYABAAAAh8AP8JHEiwoEEMCA0qVIhBza1bBektHCjxH4YYHTpM3GgxWUaOEzEksKMRJENbJE0yVCOspEqChjCwe/PSIJGENXPq3PkPTg9g/vwFQYWqR7FiZPzZI3qgFIMeOUr4chC0R1CBPezRsGclqFerXwf5M3jVq9mx/8xyvLoxIAAh+QQFCgD/ACwAAAAAGAASAAAItgD/CRxIsCAGNbdulXPiBAOGghAJYojRoWKHhLciasSQzKJHjRExJLDlsSJIiBjqGWlW8qRBNUZWdmT3xiVBZBgeGCLy4M0bSTYJZnD40CFQkNsKJhX44UKlfiexFZQq0I+bI1CDQsS06ZEQrVu7fgVbUCxZjcwEXfin5azAS4P8XUJTjAadEmTukinGlwwHAzIQWLl0yR8dfwLpHPbHGHGPHoytWKHh7zHif5cFNmZcMDNmfwEBACH5BAUKAP8ALAAAAAAYABEAAAjtAP8J/IdBza1b5Zw4wcAQAzt2/x5KHCgQQ4wOGDscvIXklh07t5Il+9fhDQaKFjHWa9bMiBGW9VaJHGgSZYx6Rta9MsFz3bqXFP/VHIhhlRETpJIqNfFqXdChFdUkrUWVQAaGhogM7PDPiSSKRjAEG/sgQwZJokSJpbjQDkUtyBo2/Erw5EBJdgQFFXgt2zYFfP1220v43zVs/27wRRyg8N6+2BQbzoatsWPCkgdavsy5s2fC/g5RYMAhjj8DxYqd4XCmmD8O/gDIgMEh14tDrzkMsmLltb/XVgb9/v3P92saxQcSD7p8eHF//wICACH5BAUKAP8ALAEAAAAXAA8AAAj/APsJHEiwoMGDBIWEUShECEKDQrRpmIWjz6wRBbg57OfkjaCCEfuA0RKgpAcwUzSEECGk48eBYTSoCrAEi00sZQJ4cPSkggiXA4XIXHLF05ejnq4sCTCkiIUKTsq9xEC1KtUkSVixsko16kcMatSoYKfVKjt2aggQCEaECAap/TAkMEKqVotg0UQhabDqQTRTJkysM4SBXaW4CV7VbYHMVIcBkBsnCzy4sDPEiu0iC2cK8oDNgAUTdhJDCAZbmVuYWu15dejKpE2rSd3igQqqKh60qEVK8NZNj4QIw2Aog3HjkkSJwnA8gyECGLZsKh0LEVeqZzhcx/DgUq4XhwICACH5BAUAAP8ALAAADQAYAAMAAAgzAA+RoQPNHx1//gR8AkGHIbQc/kLROQEtlJeDBxEazIiQjj59ihB+pGOFziCNKFOqVBkQACH5BAUAAP8ALAAADAAYAAMAAAgyAL3QEcADgb+D0HzQgYAAGgA6/gT4AAEiF8SD/uhcPAhxEJ1BVjBmFEmypEhFB/WRDAgAIfkEBQAA/wAsAAALABgAAwAACC0Ao4Dw548DAAAQEnIoUYJDDg4IIkJz6MULwYIcOFzUWPAiQY5WOHocSbKkv4AAIfkEBQAA/wAsAAAKABgAAwAACDAAaYBgw4CDD3/+OOT4UaJEDn8nfDBgwcHaJw6DEiLUuHEjB3+DOHzsOLKjyZMoAwIAIfkEBQAA/wAsAAAJABgAAwAACDIAo4AokQoBAAD6/BlIVaLEJBD+IuZIBUJArFT+Ug2yQiMVxogZQ0b8GJIkyJMoU4IMCAAh+QQFAAD/ACwAAAgAGAADAAAIMgAPgUjEI5U/fyfo0OHBo0SOSRAWssgBQmEUf3T8DcqY8SANewc7+rMi8qDJkyhTogwIACH5BAUAAP8ALAAABwAYAAMAAAgtAKNA4ODPnwAdOjgQNDgDgcIT/nJAgMbhhb+FCwsWzMhh0EaNGTWKHKnRysiAACH5BAUAAP8ALAAABgAYAAMAAAg2AKNEAcEBBISDHBQVK0YQxIkTICJy8MEhij9/HDj4s8LBij2MGzNyMKDRnyKMJS+qXMmy5cWAACH5BAUAAP8ALAAABQAYAAMAAAg6AB3A4eDPngwOHCwpK1aMjD+EHOSk+BGKw6FDBP091KdIkT2EgzT6U6QvBwdFBqx8FMmypUuNikQGBAAh+QQFAAD/ACwAAAQAGAAEAAAIOABfwHEQhcYPGf4MxFGGAoA/BxDR5Ivy0Muhhxj9PbRCw549BxoHDYKoESRIjShTqlzJsqVLlAEBACH5BAUAAP8ALAAAAwAYAAMAAAg2AOH06MEhSiwOPyiQsRKkoT97HIDBifKJwwt//jjQoMHBij1/VjhgzChyEAcOJk2OXMmypcuAACH5BAUAAP8ALAAAAgAYAAMAAAg4AKPAgePPQZ4eBvyR+SFDRp4fJbw4OBTrU46BeeAM8pcnDw2OGa2I5DhoUB5/JAmiXMmypcuVAQEAIfkEBQAA/wAsAAABABgAAwAACDEA8ziIdcgBDTheHBg4eChPnhf+DjVESCOKP38CLzq46NCKlTwXMYLEGLKkyZMo/QUEACH5BAUAAP8ALAAAAAAYAAMAAAg0AOE46MHB3otYHLzEOtSjB5wo/vxFidLwEAc4HDhE9Mdh0EaOgzpyzPiChkaPH1OqXOkvIAAh+QQFAAD/ACwAAAAAGAACAAAIFQD9CRTIYWDBgf4OElSIsKHDh/4CAgAh+QQFCgD/ACwBAAAAFgAXAAAI7QD9CRxIsKDBgwOtKLSCEOELABAhliBjb6AAAQwJPozIEaIBgRcz+rPSsSQAHz6shBxo0iTKlSdiyoxZosSnTzNjXvR34uLFmzN9AgWK8QQZlD7I4OwpgIyAEyCQPhVAwyhSpSDIaMX6QmrPqkdRYs2q9ROIqC+/WhV7liyZtl4F2Ot51elTpmFR4oRmLwdTn3d1At4rV2VOmiUO05Xrz4CPkiVanqToz95jyR0R8B0k0DHmiJrlch4p4LLk0BUJqkQKEQRoH9AEjC5oxQA0pD4QIIANzUBqhDQMCIBGPLbohgTt2aNBY5C92QQDAgAh+QQFCgD/ACwBAAEAFgAXAAAI/wD9CRxIsKDBgwOtKLSCEGGJHzIiyvhRgsbATz4YEiwRMYhHjxF/vPBnBaNGkhCDxFnJEuTEkhkHQlxpqWbNlUEi8vjxSQBDEECDAi1WTKjQnlZAQPPhA5pRpUuhOQ0VCoRPECUQIAAAYNIkCAh8lID2FYDWqtAMYNXK9WuJtyXcakWAVm3WrV0hQID7FexZEJ9ogDCLVy8EACUAGJ5bNbBStlyXAm3KdS7QXDROgAgldakPoU2lhpoEIhcCGlacPq35tDQPH6jJyPBI06alljkZvLZIA8FslSyDg9SNeRBJMjw6fozzMacMHisQ2DNOEkHyjsyd6zRNgzpJK9aviy2BIJEHD9PeE1ohkyuX+ffnQ5Gx19CKATJ0V6wIpbV7w4GD2EODAQbYM91BAQEAIfkEBQoA/wAsAQABABYAFwAACP8A/QkcONCKQYODCCpUWMeFCzRoHNYxMDAUAisKS0BEwREFxIgl/FmxmFCglYcdU3pEw4DBSB8YRaI8Q7PmGY5oKLAMBQ0jhJ9Af56xNGlS0J88rUCwiCBU0aChLD6dtAJCTwjAePCQIcMohFwIfuSCYI2B1rGhXmDVynWFtTo/4rrNenap2qxcZbi1FvfHXq080BqA8IOtDGuI+yK2BhgtDQgIDMuw+LMpV8BG8dE48TWXZ89eO3/OnMuAlbFHJ9E8+hNfoNJWyDBA09EmzY4QKbD4QdFAlo0qU+YOpNmeyBKzgascDkkCjZJWePz+SP1joEWaS4rUlytLIIhArFE4GK8bnwTjCg2SwccikHv3LBbNIENjYUEDAGbMgMR/hgQD6Nk30CA00PDCC/Y8p52AAg3iIIMDBQQAIfkEBQoA/wAsAQAAABcAGAAACP8A/QkcONCKQYODCCpcmKhKFTlyquAS82LgCgn2FFpJJOdAjY81DhyAUaWOPysXMxas4tGMy5chYcgphRLjygNmjv3ZufOYmZgNSq2YYUWgtaNIj7aJ9E1H0qNDi1qbkSXLDB1Okc6g+u2bNXjwpkoVIyUFBQrSGL1jwcDFIkadUqSQwmVqRWtkzaLtxIaPX2l85dKd6sUf3rJn03byy0ex4Lor7rqQe7aTZcaW486FbMAwPsQU0EDKcpQFpLOCiVmz0RmENS5UqLCYrYMWLWuzY1NRbWNRRX2LnlrT0aaN8NXLWFS0UoJQy2M6efr8ObKBCgYvEr44BcNjjZzQXX5xrL6MtUorPwh19w4ypEgYy5zAMqDyZKBTDWCsFzlSf4MMrmRHkBU5uHLKMvltIIl/1rHjSn0D6gOADQdSsMyFKmSAyA8GJLSQQFaQIYsrgTjhBCKuwPIChB8KNAgNL7xQAg002ONhiwQNoiOOPPa4UEAAIfkEBQoA/wAsAQAAABcAGAAACP8A/wkcONCfwYMEEyo0aKVhw0H+ChpMeDBRlSpy5FTBJeZFxIgLrSSSc6CGyRoHDsCoUgckRStVSpqZSRMlDDmlrPyTYE+gP5gHzBz7Q5ToMTM2G5Qi6M+a06cC20T6pgOq0xUEZ2TJMkNH1acztH77Zg0ePIE6Ff5j9I4FAxeLGHVS+ELtv05sCOJNOMOLQDFSBkpjRHCw2rr/XKQY2Kkxn8eN5wrk8g/rP2v4pKSgQAENpCxOWUDinCKFFGLWbBj4B8IaFypUWMj+R4vWP9mwqaC2sUigvkVPn+po0yb4UxvLWPz7WYKQzGNt9hU9ilRlAxUMXgz69+IUjJI12qR4akPdpMAGy2wQtPKD0PeS+yKdTKlymRNYBnoODHSqAQwYuLRB338wNJCBK9qtl4Mrpyzj3z+S/NfAdey4ol9CVugDgA2nEPLPMiCqkAEiPxiwnV1WkCGLK4g44QQirsDywoV2DUTDCy+UQAMN9pxY40CDBPnjQAEBACH5BAUKAP8ALAEAAQAXABcAAAj/AP8JHDjQn8GDBBMqNGilYcNB/goaTHgwUZUqcuRUwSXmRcSIC60kknOghskaBw7AqFIHJEUrVUqamUkTJQw5paz8k2BPoD+YB8wc+0OU6DEzNhuUIujPmtOnAttE+qYDqtMVBGdkyTJDR9WnM7R++2YNHjyBOhX+Y/SOBQMXixh1UvhC7b9ObAjiTTjDi0AxUgZKY0RwsNq6/1ykGAhrGjE+kDtJHsjlH9Z/1vBJSUGBAhA6epyygNQ5RQopxKzZMPAPhDUuVKiw0KMnCy1a/1iwiE0ltY1FAvUteurUxbQ2bYg/tbGMxb+fJQjJPPYPSCSjM5OqYPBi0L8Xp2CUdqxhJpIyatlrCGywzAZBKz8IiS/5T9nJlCqXOYFloOfAQKc0AIN4/+A3IAwNZOBKd+/l4MopyzQgxz+SDNhAAyqw44p/CVmhDwA2QLjMiMuokAEiPxjgnV1WkCGLK4g44QQirsDyAod2DUTDCy+UQAMN9qyYUEAAIfkEBQoA/wAsAQABABcAFwAACP8A/wkcONCKQYODCCpcmKhKFTlyquAS82LgCgn2FFpJJOdAjY81DhyAUaXOPysLT1bxaKaly5Aw5JRKaWWlmWN/cuY8ZgZmg5kzUP6zRrQo0TaRvukwSpSgtRlZstDp0kUg0RlQv337Bw+eNYJipKToMpXROxYMXCxi1ClFCilcBFYkSLVLJzZ88kq7u9BLyn9sCQYmuGKuixQDO3UiqDilAYH4pAyk6oIoC0gUKAwk9s+GQBDWuFChwqJLLxe0aFljwWI0FWLWbCyqqG+RURcu/rVpM5SpjWUsBFopQYilMj1ndPLsObKBCgb/Bvl7cQqGxxoolP2j1vJj82U2DNh183fyByHrHrVX835A4DInsAj6sxLoVAMYMJQBETkSf4MMrrwgHUE5uHLKMvf9I4l/zrHjynjkDTSfPgDYcAoh/yyjoQoZIPKDAQkt5M98ZMjiCiJOOIGIK7C8AOFf/4w4CA0vvFACDTTYMyCMBA0i3YhAphQQACH5BAUKAP8ALAEAAAAXABgAAAj/AP/9S0RQoEArCBEOMsjQIC86iQQmqlJFjpwquMS8MLhCgj2HvDglknOghskaBw7AqFLnn5WGByNFqmGmpk2UMOSUgumyygEzx/4IFXrMDM4GO2e8/GetqdOmbSJ90/G0KUNrM7JkcaFHh8CmM7J++/YPHjxrDMVIScGJwQpG71gwcLGIUacUKaRwEbix4ZkVndjwGSwtMEwvDV38W2GtE0O7DVf0dZFCIJpOjg1i5mlAID4pBtFAytKUBSQKFAwS+2dDIAhrXKhQkZtrBS1a1liwkE2FmDUbizbqW/R0hfE2bZhWtbGMxcEShEqa2Ud9aFGjKhuoYPBvkL8Xp2CUhzR47LrJ7MtsGLDnz+UPQuIP/APyr9p5+f+WOYHF0J+VQKc0AAMMAqWk0oANZODKC94xlIMrpyzTwD/KSIKgduy4wl57BvmnDwA2RJjfMsuokAEiPxiwEEz++EeGLK7844QTiLgCywsb8iRQi4PQ8MILJdBAgz0N6tjQIN61qKSRDS3JpEABAQAh+QQFCgD/ACwBAAAAFwAYAAAI/wD//XtB44VAgf4SKjzI8CCcQfYQ+rNCkeIgfwcX/vPFyZeXhImqVJEjpwouMS8wYmRYLBEvMl3kHKhBs8aBAzCq1FnZcGKVmWaCCrUJQ04pK/8kRPzn84CZY3+iRj1mhmiDUgz9Wdvaa4U1gW0ifdOx9evWFQxnZMkikEdZazPUfvtmDR48gUgbCmT0jgUDF4sYddJrsKELgWwYdkqc1otAMVIOSmPEcLLegQJdpDjYqTOfz50HC+TyD+0/a/ikpKBA4eBWFpBYp0ghhZg1Gwb+gbDGhQoVFnoE0qL1jwUL31Rs21gkUN+it0D0ZGnT5m1ZG8tYMLVSghDQg1KpVofF2UAFgxeDBp6CMbPGP2X/qAWlKbDBMhsMrfwgxH6mwGo03YTTMk7AYsBSAgVySgMwwCCQgA3C0EAGrqCXXw6unLIMg/9I0mAD5bHjCoL56QOADacQ8s8yLKqQASI/GJDeZf9YQYYsriDihBOIuALLCyTSKFBBL5RAAw32zCjkQYM0ueRBAQEAOw==';
      var file = new AV.File("myfile.gif", {
          base64: base64
      });
      file.save().then(function(data) {
        var url = data.url();
        // check image url has image data.
        var xmlhttprequest;
        if (typeof XMLHttpRequest === 'undefined') {
          xmlhttprequest = require('xmlhttprequest').XMLHttpRequest;
        } else {
          xmlhttprequest = XMLHttpRequest;
        }
        var xhr = new xmlhttprequest();
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              // check response is a gif image.
              if (xhr.responseText.indexOf('GIF89a\u0018\u0000\u0018') !== -1) {
                done();
              }
            } else {
              done(xhr.status);
            }
          }
        };
        xhr.open('get', url, true);
        xhr.send();
      }).catch(function(error) {
        done(error);
      });
    });
  });

  describe("Test withURL", function(){

    it("should be saved", function(done){
      var url = "http://i1.wp.com/blog.avoscloud.com/wp-content/uploads/2014/05/screen568x568-1.jpg?resize=202%2C360";
      var file = AV.File.withURL('screen.jpg', url);
      file.save().then(function(){
        // console.log(file.url());
        // console.log(file.id);
        expect(file.ownerId()).to.be.ok();
        expect(file.id).to.be.ok();
        expect(file.metaData('__source')).to.be('external');
        done();
      }, function(error){
        done(error);
      });
    });
  });

  if(AV._isNode){
    describe("Saving buffer in node.js", function(){
      it("should be saved", function(done){
          var file = new AV.File('myfile.txt', new Buffer('hello world'));
          file.save().then(function(){
            // console.log("saved buffer...");
            // console.log(file.url());
            // console.log(file.id);
            // console.log(file.metaData());
            expect(file.size()).to.be(11);
            expect(file.ownerId()).to.be.ok();
            expect(file.id).to.be.ok();
            // console.log(file.thumbnailURL(200, 100));
            expect(file.thumbnailURL(200, 100)).to.be(file.url() + "?imageView/2/w/200/h/100/q/100/format/png");
            file.destroy().then(function(){
              done();
            }, function(error){
              done(error);
            });
          }, function(error){
            done(error);
          });
      });
    });
  }


  describe("Saving array", function(){
    it("should be saved", function(done){
      setTimeout(function() {
        var bytes = [ 0xBE, 0xEF, 0xCA, 0xFE ];
        var file = new AV.File("myfile.txt", bytes);
        file.save().then(function(){
          // console.log(file.url());
          // console.log(file.id);
          // console.log(file.metaData());
          expect(file.size()).to.be(4);
          expect(file.ownerId()).to.be.ok();
          expect(file.id).to.be.ok();
          file.destroy().then(function(){
            done();
          }, function(error){
            done(error);
          });
        }, function(error){
          done(error);
        });
      }, 1000);
    });
  });

  describe("Saving file with object", function(){
    it("should be saved", function(done){
      var bytes = [ 0xBE, 0xEF, 0xCA, 0xFE ];
      var file = new AV.File("myfile.txt", bytes);
      file.save().then(function(){
        // console.log(file.url());
        // console.log(file.id);
        var jobApplication = new AV.Object("JobApplication");
        jobApplication.set("applicantName", "Joe Smith");
        jobApplication.set("applicantResumeFile", file);
        jobApplication.save().then(function(result){
          expect(result.id).to.be.ok();
          var query = new AV.Query("JobApplication");
          query.get(result.id, {
            success: function(ja) {
              expect(ja.id).to.be.ok();
              var arf = ja.get("applicantResumeFile");
              // console.log(arf.metaData());
              expect(arf).to.be.ok();
              expect(arf.size()).to.be(4);
              expect(arf.ownerId()).to.be.ok();
              // console.log(ja.get("applicantResumeFile"));
              file.destroy().then(function(){
                done();
              }, function(error){
                done(error);
              });
            },
            error: function(object, error) {
              done(error);
            }
          });

        }, function(obj, error){
          done(error);
        });
      }, function(error){
        done(error);
      });
    });
  });

  describe('Fetch', function(){
    var fileId = '52f9dd5ae4b019816c865985';
    it('createWithoutData() should return a File', function(){
      var file = AV.File.createWithoutData(fileId);
      expect(file).to.be.a(AV.File);
      expect(file.id).to.be(fileId);
    });
    it('save a fetched file should throw', function(){
      var file = AV.File.createWithoutData(fileId);
      expect(function saveFetchedFile(){
        file.save();
      }).to.throwError(/File already saved\./);
    });
    it('fetch() should retrieve all data', function(done){
      var file = AV.File.createWithoutData(fileId);
      file.fetch().then(function(file){
        expect(file).to.be.a(AV.File);
        expect(file.id).to.be(fileId);
        expect(file.name()).to.be('myfile.txt');
        expect(typeof file.url()).to.be('string');
        done();
      }).catch(function(err){
        console.log(err);
      });
    });
  });
});
