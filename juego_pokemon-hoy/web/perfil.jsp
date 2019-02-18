<%@page import="Modelos.Usuario"%>
<%@page import="Modelos.Personaje"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<%
	HttpSession HS = request.getSession();
	Usuario usuario = (Usuario)HS.getAttribute("usuario");
        
	if(usuario == null){
	response.sendRedirect("index.jsp");
	}	
        
        Personaje personaje= (Personaje)request.getAttribute("personaje");
	String nombre_personaje =personaje.nombre;
        
	int Nivel = personaje.nivel;
	int Exp = personaje.experiencia;
	int Pokemonedas = personaje.pokemonedas;
	
	boolean Medalla1=true;
	boolean Medalla2=true;
	boolean Medalla3=true;
	
	String genero = personaje.genero;
	String raza = personaje.raza;
	String equipo = personaje.equipo;
	String colorOjos = personaje.color_ojos;
	String colorPelo = personaje.color_pelo;
	
String pkmn1 = "https://img.pokemondb.net/artwork/bulbasaur.jpg";
	String pkmn2 = "https://img.pokemondb.net/artwork/charizard.jpg";
	String pkmn3 = "https://img.pokemondb.net/artwork/pikachu.jpg";
	String pkmn4 = "https://img.pokemondb.net/artwork/muk.jpg";
	String pkmn5 = "https://img.pokemondb.net/artwork/croconaw.jpg";
	String pkmn6 = "https://img.pokemondb.net/artwork/gigalith.jpg";
%>

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Perfil</title>
        <link href="css/pagina.css" rel="stylesheet" type="text/css"/>
		<link href="css/JP.css" rel="stylesheet" type="text/css"/>
    </head>
    <body bgcolor="#f0f0fd">
		<div>
			
		</div>
        <div align="left">
		<div class='Banner'>
			<div>
				<a href="#">
					<img class='BannerIMG' src="https://fontmeme.com/permalink/190125/cdd3d9c68e05fca2e7c519691f72f3cd.png" alt="Perfil">
				</a>
			</div>
			<div id='nUsuario'>
				<%= usuario.nombre%>
			</div>
		</div>
        </div>
        <div id="personaje" align="left" style="background-color:skyblue; width:25%;">
            <div align="center">
            <h2><%=nombre_personaje%></h2><br>
                <%
			out.print("<div class='charDiv'><img class='charPhoto' src='pic/"+genero+".png'></div>");
			out.print("<div class='charDiv'><img class='charPhoto' src='pic/"+genero+"/raza/"+raza+".png'></div>");
			out.print("<div class='charDiv'><img class='charPhoto' src='pic/"+genero+"/equipo/"+equipo+".png'></div>");
			out.print("<div class='charDiv'><img class='charPhoto' src='pic/"+genero+"/colorOjos/"+colorOjos+".png'></div>");
			out.print("<div class='charDiv'><img class='charPhoto' src='pic/"+genero+"/colorPelo/"+colorPelo+".png'></div>");
		%>
		<div id='charStats'>
			<div>Nivel: <%=Nivel%></div>
			<div>Exp: <%=Exp%></div>
			<div>Pokemonedas: <%=Pokemonedas%></div>
		</div>
            </div>
        </div>
        <div id="pokemones" align="center" style="background-color:greenyellow; width:25%;">
		<!--<div style="height:10%"></div>-->
            <h2>Pokemones</h2>
        <div style="height:5%"></div>
		<%
		out.print("<div>");
		out.print("<img src='"+pkmn1+"' width='60' height='60' border='2px' class='poke'>");
		out.print("<img src='"+pkmn2+"' width='60' height='60' border='2px' class='poke'>");
		out.print("<img src='"+pkmn3+"' width='60' height='60' border='2px' class='poke'>");
		out.print("<div></div>");
		out.print("<img src='"+pkmn4+"' width='60' height='60' border='2px' class='poke'>");
		out.print("<img src='"+pkmn5+"' width='60' height='60' border='2px' class='poke'>");
		out.print("<img src='"+pkmn6+"' width='60' height='60' border='2px' class='poke'>");
		out.print("</div>");
		%>
        <!--<div style="height:10%"></div>-->
        <h2>Medallas</h2>
			<div>
			<%
				if(Medalla1){
					out.print("<img src='pic/medalla1.png' width='60' height='60'>");
				}
				else{
					out.print("<img src='pic/medalNotch.png' width='60' height='60'>");
				}
				
				if(Medalla2){
					out.print("<img src='pic/medalla2.png' width='60' height='60'>");
				}
				else{
					out.print("<img src='pic/medalNotch.png' width='60' height='60'>");
				}
				
				if(Medalla3){
					out.print("<img src='pic/medalla3.png' width='60' height='60'>");
				}
				else{
					out.print("<img src='pic/medalNotch.png' width='60' height='60'>");
				}
			%>
			</div>
		</div>
        <div align="center" id="opciones">
			<a href="Cerrar">
				<img src="https://fontmeme.com/permalink/190125/78758a24caa3460432d012965af22750.png" alt="Salir" class='profileButtons'>
			</a>
			<a href="preparar">
				<img src="https://fontmeme.com/permalink/190125/b491790f3625bbb0847e75f553cfdca1.png" alt="Jugar" class='profileButtons'>
			</a>
			<a href="servletPC">
				<img src="https://fontmeme.com/permalink/190204/f8e9a16ac025cc70790abd651b7594df.png" alt="PC" class='profileButtons'>
			</a>
			<a href="pokedex.jsp">
				<img src="https://fontmeme.com/permalink/190206/7ab1e18883d333af7aa22de5d961caed.png" alt="Pokédex" class='profileButtons'>
			</a>
			<a href="Bazar.jsp">
				<img src="https://fontmeme.com/permalink/190206/e1cd2ee429f5411b181884a7d4caba36.png" alt="Bazar" class='profileButtons'>
			</a>
			<a href="configuracion.jsp">
				<img src="https://fontmeme.com/permalink/190125/daf6d4535e123fe2c82fdf5d4b1bfafc.png" alt="Configuración" class='profileButtons'>
			</a>
        </div>
    </body>
</html>