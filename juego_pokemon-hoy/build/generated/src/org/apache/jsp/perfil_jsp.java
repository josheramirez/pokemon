package org.apache.jsp;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.jsp.*;
import Modelos.Usuario;
import Modelos.Personaje;

public final class perfil_jsp extends org.apache.jasper.runtime.HttpJspBase
    implements org.apache.jasper.runtime.JspSourceDependent {

  private static final JspFactory _jspxFactory = JspFactory.getDefaultFactory();

  private static java.util.List<String> _jspx_dependants;

  private org.glassfish.jsp.api.ResourceInjector _jspx_resourceInjector;

  public java.util.List<String> getDependants() {
    return _jspx_dependants;
  }

  public void _jspService(HttpServletRequest request, HttpServletResponse response)
        throws java.io.IOException, ServletException {

    PageContext pageContext = null;
    HttpSession session = null;
    ServletContext application = null;
    ServletConfig config = null;
    JspWriter out = null;
    Object page = this;
    JspWriter _jspx_out = null;
    PageContext _jspx_page_context = null;

    try {
      response.setContentType("text/html;charset=UTF-8");
      pageContext = _jspxFactory.getPageContext(this, request, response,
      			null, true, 8192, true);
      _jspx_page_context = pageContext;
      application = pageContext.getServletContext();
      config = pageContext.getServletConfig();
      session = pageContext.getSession();
      out = pageContext.getOut();
      _jspx_out = out;
      _jspx_resourceInjector = (org.glassfish.jsp.api.ResourceInjector) application.getAttribute("com.sun.appserv.jsp.resource.injector");

      out.write("\n");
      out.write("\n");
      out.write("\n");
      out.write("<!DOCTYPE html>\n");

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

      out.write("\n");
      out.write("\n");
      out.write("<html>\n");
      out.write("    <head>\n");
      out.write("        <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">\n");
      out.write("        <title>Perfil</title>\n");
      out.write("        <link href=\"css/pagina.css\" rel=\"stylesheet\" type=\"text/css\"/>\n");
      out.write("\t\t<link href=\"css/JP.css\" rel=\"stylesheet\" type=\"text/css\"/>\n");
      out.write("    </head>\n");
      out.write("    <body bgcolor=\"#f0f0fd\">\n");
      out.write("\t\t<div>\n");
      out.write("\t\t\t\n");
      out.write("\t\t</div>\n");
      out.write("        <div align=\"left\">\n");
      out.write("\t\t<div class='Banner'>\n");
      out.write("\t\t\t<div>\n");
      out.write("\t\t\t\t<a href=\"#\">\n");
      out.write("\t\t\t\t\t<img class='BannerIMG' src=\"https://fontmeme.com/permalink/190125/cdd3d9c68e05fca2e7c519691f72f3cd.png\" alt=\"Perfil\">\n");
      out.write("\t\t\t\t</a>\n");
      out.write("\t\t\t</div>\n");
      out.write("\t\t\t<div id='nUsuario'>\n");
      out.write("\t\t\t\t");
      out.print( usuario.nombre);
      out.write("\n");
      out.write("\t\t\t</div>\n");
      out.write("\t\t</div>\n");
      out.write("        </div>\n");
      out.write("        <div id=\"personaje\" align=\"left\" style=\"background-color:skyblue; width:25%;\">\n");
      out.write("            <div align=\"center\">\n");
      out.write("            <h2>");
      out.print(nombre_personaje);
      out.write("</h2><br>\n");
      out.write("                ");

			out.print("<div class='charDiv'><img class='charPhoto' src='pic/"+genero+".png'></div>");
			out.print("<div class='charDiv'><img class='charPhoto' src='pic/"+genero+"/raza/"+raza+".png'></div>");
			out.print("<div class='charDiv'><img class='charPhoto' src='pic/"+genero+"/equipo/"+equipo+".png'></div>");
			out.print("<div class='charDiv'><img class='charPhoto' src='pic/"+genero+"/colorOjos/"+colorOjos+".png'></div>");
			out.print("<div class='charDiv'><img class='charPhoto' src='pic/"+genero+"/colorPelo/"+colorPelo+".png'></div>");
		
      out.write("\n");
      out.write("\t\t<div id='charStats'>\n");
      out.write("\t\t\t<div>Nivel: ");
      out.print(Nivel);
      out.write("</div>\n");
      out.write("\t\t\t<div>Exp: ");
      out.print(Exp);
      out.write("</div>\n");
      out.write("\t\t\t<div>Pokemonedas: ");
      out.print(Pokemonedas);
      out.write("</div>\n");
      out.write("\t\t</div>\n");
      out.write("            </div>\n");
      out.write("        </div>\n");
      out.write("        <div id=\"pokemones\" align=\"center\" style=\"background-color:greenyellow; width:25%;\">\n");
      out.write("\t\t<!--<div style=\"height:10%\"></div>-->\n");
      out.write("            <h2>Pokemones</h2>\n");
      out.write("        <div style=\"height:5%\"></div>\n");
      out.write("\t\t");

		out.print("<div>");
		out.print("<img src='"+pkmn1+"' width='60' height='60' border='2px' class='poke'>");
		out.print("<img src='"+pkmn2+"' width='60' height='60' border='2px' class='poke'>");
		out.print("<img src='"+pkmn3+"' width='60' height='60' border='2px' class='poke'>");
		out.print("<div></div>");
		out.print("<img src='"+pkmn4+"' width='60' height='60' border='2px' class='poke'>");
		out.print("<img src='"+pkmn5+"' width='60' height='60' border='2px' class='poke'>");
		out.print("<img src='"+pkmn6+"' width='60' height='60' border='2px' class='poke'>");
		out.print("</div>");
		
      out.write("\n");
      out.write("        <!--<div style=\"height:10%\"></div>-->\n");
      out.write("        <h2>Medallas</h2>\n");
      out.write("\t\t\t<div>\n");
      out.write("\t\t\t");

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
			
      out.write("\n");
      out.write("\t\t\t</div>\n");
      out.write("\t\t</div>\n");
      out.write("        <div align=\"center\" id=\"opciones\">\n");
      out.write("\t\t\t<a href=\"Cerrar\">\n");
      out.write("\t\t\t\t<img src=\"https://fontmeme.com/permalink/190125/78758a24caa3460432d012965af22750.png\" alt=\"Salir\" class='profileButtons'>\n");
      out.write("\t\t\t</a>\n");
      out.write("\t\t\t<a href=\"preparar\">\n");
      out.write("\t\t\t\t<img src=\"https://fontmeme.com/permalink/190125/b491790f3625bbb0847e75f553cfdca1.png\" alt=\"Jugar\" class='profileButtons'>\n");
      out.write("\t\t\t</a>\n");
      out.write("\t\t\t<a href=\"servletPC\">\n");
      out.write("\t\t\t\t<img src=\"https://fontmeme.com/permalink/190204/f8e9a16ac025cc70790abd651b7594df.png\" alt=\"PC\" class='profileButtons'>\n");
      out.write("\t\t\t</a>\n");
      out.write("\t\t\t<a href=\"pokedex.jsp\">\n");
      out.write("\t\t\t\t<img src=\"https://fontmeme.com/permalink/190206/7ab1e18883d333af7aa22de5d961caed.png\" alt=\"Pokédex\" class='profileButtons'>\n");
      out.write("\t\t\t</a>\n");
      out.write("\t\t\t<a href=\"Bazar.jsp\">\n");
      out.write("\t\t\t\t<img src=\"https://fontmeme.com/permalink/190206/e1cd2ee429f5411b181884a7d4caba36.png\" alt=\"Bazar\" class='profileButtons'>\n");
      out.write("\t\t\t</a>\n");
      out.write("\t\t\t<a href=\"configuracion.jsp\">\n");
      out.write("\t\t\t\t<img src=\"https://fontmeme.com/permalink/190125/daf6d4535e123fe2c82fdf5d4b1bfafc.png\" alt=\"Configuración\" class='profileButtons'>\n");
      out.write("\t\t\t</a>\n");
      out.write("        </div>\n");
      out.write("    </body>\n");
      out.write("</html>");
    } catch (Throwable t) {
      if (!(t instanceof SkipPageException)){
        out = _jspx_out;
        if (out != null && out.getBufferSize() != 0)
          out.clearBuffer();
        if (_jspx_page_context != null) _jspx_page_context.handlePageException(t);
        else throw new ServletException(t);
      }
    } finally {
      _jspxFactory.releasePageContext(_jspx_page_context);
    }
  }
}
