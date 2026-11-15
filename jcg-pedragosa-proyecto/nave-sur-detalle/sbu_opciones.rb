# SBU - elegir variantes. Correr DESPUES de sbu_etiquetas.rb
#   load '.../sbu_opciones.rb'
#   SBU.opcion(patas: :cenefa, apoyos: :chapa, panel: :blanco_grafito)
# patas:  :cenefa | :piedra
# apoyos: :chapa | :madera | :piedra
# panel:  :blanco_grafito (muro blanco, techo grafito) | :blanco | :gris_claro | :muro_gris_techo_grafito
module SBU
  PANEL = {
    blanco_grafito: [[236,236,230],[56,59,63]],
    blanco: [[236,236,230],[236,236,230]],
    gris_claro: [[196,200,203],[179,184,188]],
    muro_gris_techo_grafito: [[196,200,203],[56,59,63]]
  }
  def self.opcion(patas: :cenefa, apoyos: :chapa, panel: :blanco_grafito)
    m = Sketchup.active_model
    m.start_operation('Opciones SBU', true)
    pt = {cenefa: '10b', piedra: '10c'}
    ap = {chapa: '11a', madera: '11b', piedra: '11c'}
    m.layers.each do |l|
      if l.name =~ /^(10[bc]|11[abc]) /
        l.visible = ($1 == pt[patas] || $1 == ap[apoyos])
      end
    end
    cm, ct = PANEL[panel]
    m.materials.each do |mat|
      mat.color = Sketchup::Color.new(*cm) if mat.display_name == 'Panel muro'
      mat.color = Sketchup::Color.new(*ct) if mat.display_name == 'Panel techo'
    end
    m.commit_operation
    puts "Patas: #{patas} | Apoyos: #{apoyos} | Panel: #{panel}"
  end
end
puts 'Listo. Usar: SBU.opcion(patas: :piedra, apoyos: :madera, panel: :gris_claro)'
