# SBU - elegir variantes. Correr DESPUES de sbu_etiquetas.rb
#   SBU.opcion(patas: :piedra, apoyos: :solei, panel: :gris_claro)
# patas:  :cenefa | :piedra   (piedra = columnas de piedra en el frente + alero de techo de 25 cm)
# apoyos: :chapa | :solei     (apoyos de las viseras laterales)
# panel:  :madera_grafito (cenefa de madera + techo grafito) | :blanco | :gris_claro  (cambia TODA la fachada y el techo)
module SBU
  COL = {
    madera_grafito: {'Panel muro'=>[236,236,230], 'Panel techo'=>[56,59,63], 'Cenefa'=>[77,63,52], 'Cumbrera'=>[38,41,44], 'Cielorraso'=>[143,106,62]},
    blanco:         {'Panel muro'=>[236,236,230], 'Panel techo'=>[236,236,230], 'Cenefa'=>[236,236,230], 'Cumbrera'=>[214,214,208], 'Cielorraso'=>[236,236,230]},
    gris_claro:     {'Panel muro'=>[196,200,203], 'Panel techo'=>[196,200,203], 'Cenefa'=>[196,200,203], 'Cumbrera'=>[174,179,183], 'Cielorraso'=>[196,200,203]}
  }
  def self.opcion(patas: :cenefa, apoyos: :chapa, panel: :madera_grafito)
    m = Sketchup.active_model
    m.start_operation('Opciones SBU', true)
    activas = []
    activas << (patas == :piedra ? '06c' : '06b')
    activas << '03b' if patas == :piedra
    activas << (apoyos == :solei ? '07b' : '07a')
    m.layers.each do |l|
      if l.name =~ /^(03b|06b|06c|07a|07b) /
        l.visible = activas.include?($1)
      end
    end
    COL[panel].each do |nombre, rgb|
      m.materials.each do |mat|
        mat.color = Sketchup::Color.new(*rgb) if mat.display_name.start_with?(nombre)
      end
    end
    m.commit_operation
    puts "Patas: #{patas} | Apoyos: #{apoyos} | Panel: #{panel}"
  end
end
puts 'Listo. Usar: SBU.opcion(patas: :piedra, apoyos: :solei, panel: :gris_claro)'
