$(window).load(function(){
    //this creates the smooth scrolling effect (in conjunction with jquery.scrollTo.js)
    $("nav a").click(function(e){
        if($(e.target).attr('href').indexOf('#') == -1) return;
        e.preventDefault();
        $("html,body").scrollTo(this.hash, this.hash);
        $(this).addClass("active");
    });
});