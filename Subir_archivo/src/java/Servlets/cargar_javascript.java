/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Servlets;

import Modelos.Pokedex;
import Modelos.Pokemon;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author Hospital
 */
public class cargar_javascript extends HttpServlet {

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        
        // LLENADO DE EQUIPO POKEMON (aun no implementado)
        ArrayList<Pokedex> ataques_oponente = new ArrayList<Pokedex>();
        
        // LLENADO POKEMON USUARIO (datos estaticos de prueba)
        Pokemon pokemon_usuario=new Pokemon();
        pokemon_usuario.nombre="Blastoise";
        pokemon_usuario.hp=70;
        pokemon_usuario.nivel=65;
        pokemon_usuario.imagen="http://bit.ly/blastoisegif";
        pokemon_usuario.ataque_1="CAÑON";
        pokemon_usuario.ataque_2="LATIGASO";
        pokemon_usuario.ataque_3="EMBESTIDA";
        pokemon_usuario.ataque_4="BURBUJAS";
        
        String[] ataques_usuario=pokemon_usuario.getAtaques();
        
        // LLENADO POKEMON OPONENTE (datos estaticos de prueba)
        Pokemon pokemon_oponente=new Pokemon();
        pokemon_oponente.nombre="Charizard";
        pokemon_oponente.hp=90;
        pokemon_oponente.nivel=35;
        pokemon_oponente.imagen="http://img.pokemondb.net/sprites/black-white/anim/normal/charizard.gif";
        pokemon_oponente.ataque_1="FUEGO";
        pokemon_oponente.ataque_2="CASTIGO";
        pokemon_oponente.ataque_3="EMBESTIDA";
        pokemon_oponente.ataque_4="TANQUE";
        
        
        int usuario_HP = pokemon_usuario.hp;
        int oponente_HP =  pokemon_oponente.hp;
        int turno_usuario = 0;
        
        
        // RESPUESTA DINAMICA
        try (PrintWriter out = response.getWriter()) {
            out.println("<!DOCTYPE html>");
            out.println("<html>");
            out.println("<head>");
                out.println("<title>Servlet carga_javascript</title>");
                out.println("<style>");
                    RequestDispatcher rd = request.getRequestDispatcher("/WEB-INF/css/pokemon.css");
                    rd.include(request, response);
                out.println("</style>"); 
            
                out.println("<script>");   
                    RequestDispatcher rd_javascript = request.getRequestDispatcher("/WEB-INF/javascript/pokemon.js");
                    rd_javascript.include(request, response);
               
                    out.println("var userHP ="+usuario_HP+";");
                    out.println("var opHP ="+oponente_HP+";");
                    out.println("playerMove ="+turno_usuario+";");

                    
                    // CREACION DINAMICA DE ATAQUES
                    for(String ataque:ataques_usuario){
                         out.println("function "+ataque+"()");
                         out.println("{");
                         out.println("  if(playerMove == 0 && userHP != 0) {");
                         out.println("      var miss = Math.floor((Math.random() * 10) + 1);");
                         out.println("      if(miss == 1) {");
                         out.println("          document.getElementById('message').innerHTML = \""+pokemon_usuario.nombre+" fallo!\";");
                         out.println("      }");
                         out.println("      else {");
                         out.println("          document.getElementById('message').innerHTML = \" "+pokemon_usuario.nombre+" usa "+ataque+" \";");
                         out.println("          var critical = Math.floor((Math.random() * 10) + 1);");
                         out.println("          if(critical == 4){");
                         out.println("              for(var x = 0; x < 2; x++){");
                         out.println("                  opHP = opHP - 30;");
                         out.println("              }");
                         out.println("          }");
                         out.println("          else{");
                         out.println("              opHP = opHP - 30;");
                         out.println("          }");
                         out.println("          if(opHP < 0){ opHP = 0}");
                         out.println("          document.getElementById('apHP').innerHTML = opHP;");
                         out.println("          if(opHP == 0){");
                         out.println("              document.getElementById('message').innerHTML = \" EL CONTRINCANTE COPERO! \"");
                         out.println("          }");
                         out.println("      }");

                         // cambiar valor a 1 para hacer turnos
                         out.println("      playerMove = 1;");

                         out.println("  }");
                         out.println("  console.log(playerMove,)");
                         out.println("}");  
                    }
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    out.println("opAttacks = [flameThrower, dragonClaw, ember, growl];");
                    

                    out.println("function compPokemon() {");
                    out.println("if(playerMove == 1 && opHP != 0) {");
                    out.println("var move = Math.floor((Math.random() * 4));");
                    out.println("console.log('movimiento '+move)");
                    out.println("opAttacks[move]();");
                    out.println("playerMove = 0;");
                    
                    out.println("}");
                    out.println("}");

            
           
                out.println("</script>");     
            out.println("</head>");
            
            
            out.println("<body>");
            
            
            
                //out.println("<div id = \"message\" class=\"message\">");
                //out.println("Que hara "+pokemon_usuario.nombre);
                //out.println("</div>");


                out.println("<div class=\"actions\">");
                    for(String ataque:ataques_usuario){
                       out.println("<button onclick =\""+ataque+"()\">"+ataque+"</button>");
                    }
                out.println("</div>");
                
                //out.println("<div id = 'apHP' class='hp-count'>100</div>");
                
                
                // datos de prueba
                

                
                
                request.setAttribute("nombre_pokemon_usr", pokemon_usuario.nombre);
                request.setAttribute("nombre_pokemon_op", pokemon_oponente.nombre);
                request.setAttribute("img_usr", pokemon_usuario.imagen);
                request.setAttribute("img_op", pokemon_oponente.imagen);
                request.setAttribute("hp_usr", pokemon_usuario.hp);
                request.setAttribute("hp_op", pokemon_oponente.hp);
                request.setAttribute("level_usr", pokemon_usuario.nivel);
                request.setAttribute("level_op", pokemon_oponente.nivel);
                
                
                RequestDispatcher rd2 = request.getRequestDispatcher("arena_layout.jsp");
		rd2.include(request, response);
                
                
                // CREACION DIV BOTONES DE ATAQUE 
                out.println("<div class=\"actions\">");
                    for(String ataque:ataques_usuario){
                       
                       out.println("<button onclick =\""+ataque+"()\">"+ataque+"</button>");
                    }
                out.println("</div>");
                out.println("</div>");
         
            out.println("</body>");
            out.println("</html>");
        }
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}
