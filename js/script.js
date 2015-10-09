/* ALIGN VERTICALY */


/* ALIGN VERTICALY */

/* INDEX.PHP */
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
/* INDEX.PHP */


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

/*CNPJ LOGIN MASK */

$(function() {
    $.mask.definitions['~'] = "[+-]";
    $("#telefone").mask("(99) 99999 - 9999");
});
$("input").blur(function() {
    $("#info").html("Unmasked value: " + $(this).mask());
}).dblclick(function() {
    $(this).unmask();
}); 

/*CNPJ LOGIN MASK */

/* HOME.PHP AUTO SEARCH */
//função para pegar o objeto ajax do navegador
function xmlhttp()
{
    // XMLHttpRequest para firefox e outros navegadores
    if (window.XMLHttpRequest)
    {
        return new XMLHttpRequest();
    }
    // ActiveXObject para navegadores microsoft
    var versao = ['Microsoft.XMLHttp', 'Msxml2.XMLHttp', 'Msxml2.XMLHttp.6.0', 'Msxml2.XMLHttp.5.0', 'Msxml2.XMLHttp.4.0', 'Msxml2.XMLHttp.3.0','Msxml2.DOMDocument.3.0'];
    for (var i = 0; i < versao.length; i++)
    {
        try
        {
            return new ActiveXObject(versao[i]);
        }
        catch(e)
        {
            alert("Seu navegador não possui recursos para o uso do AJAX!");
        }
    } // fecha for
    return null;
} // fecha função xmlhttp
//função para fazer a requisição da página que efetuará a consulta no DB
function carregar()
{
   a = document.getElementById('busca').value;
   ajax = xmlhttp();
   if (ajax)
   {
       ajax.open('get','search_products.php?busca='+a, true);
       ajax.onreadystatechange = trazconteudo; 
       ajax.send(null);
   }
}
//função para incluir o conteúdo na pagina
function trazconteudo()
{
    if (ajax.readyState==4)
    {
        if (ajax.status==200)
        {
            document.getElementById('resultados').innerHTML = ajax.responseText;
        }
    }
}

/* HOME.PHP */