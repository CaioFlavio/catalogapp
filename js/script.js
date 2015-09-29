/* ALIGN VERTICALY */

$(document).ready(function(){
    site.resize();

    $(window).resize(function(){
        site.resize();
    });
});

var site = {
    resize: function(){
        var new_margin = Math.ceil(($(window).height() - $('#login').height()) / 2);
        $('#login').css('margin-top', new_margin + 'px');
    }
};  

/* ALIGN VERTICALY */

/*CNPJ LOGIN MASK */

$(function() {
    $.mask.definitions['~'] = "[+-]";
    $("#cnpj").mask("99.999.999/9999-99");
});
$("input").blur(function() {
    $("#info").html("Unmasked value: " + $(this).mask());
}).dblclick(function() {
    $(this).unmask();
});	

/*CNPJ LOGIN MASK */