//articles
$.getJSON("/articles", function (data){
    for (var i =0; i< data.length; i++) {
        $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].img_url + data[i].link + "</p>"); 
    
    }
});


//scrape 
$('#scrape').on('click', function (e){
    e.preventDefault();
    $.ajax({
      url: '/scrape/newArticles',
      type: 'GET',
      success: function (response) {
        console.log("new articles scraped");
      },
      error: function (error) {
        console.log("error");
      },
      complete: function (result){
        console.log("complete");
      }
    });
  });//end of #scrape click event

  //click event to save an article
