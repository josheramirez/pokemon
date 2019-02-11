/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Modelos;

/**
 *
 * @author Hospital
 */
public class Pokemon {
    public String nombre; 
    public String ataque_1;
    public String ataque_2;
    public String ataque_3;
    public String ataque_4;
    
    public String[] getAtaques(){
        String[] ataques=new String[4];
        ataques[0]=ataque_1;
        ataques[1]=ataque_2;
        ataques[2]=ataque_3;
        ataques[3]=ataque_4;
        return ataques;
    }
}
