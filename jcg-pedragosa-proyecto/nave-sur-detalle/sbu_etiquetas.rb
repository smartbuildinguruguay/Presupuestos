# SBU - asigna una etiqueta (tag) a cada grupo principal del modelo importado
# Uso: importar el .dae (queda seleccionado), y correr este archivo en la consola Ruby.
# Las variantes (03b, 06c, 07b) quedan apagadas; se eligen con sbu_opciones.rb
model = Sketchup.active_model
model.start_operation('Etiquetas SBU', true)
cuenta = 0
vistos = []
apagadas = ['03b', '06c', '07b']
recorrer = lambda do |ents|
  ents.each do |e|
    next unless e.is_a?(Sketchup::Group) || e.is_a?(Sketchup::ComponentInstance)
    nombres = [e.name.to_s, e.definition.name.to_s].map { |n| n.strip }
    vistos << nombres.reject(&:empty?).first.to_s if vistos.size < 12
    nombre = nombres.find { |n| n =~ /^\d\d[a-z]? / }
    if nombre
      nombre =~ /^(\d\d[a-z]?) /
      tag = model.layers[nombre] || model.layers.add(nombre)
      e.layer = tag
      tag.visible = !apagadas.include?($1)
      cuenta += 1
    end
    recorrer.call(e.definition.entities)
  end
end
recorrer.call(model.entities)
model.commit_operation
puts "Etiquetas asignadas: #{cuenta}"
if cuenta == 0
  puts "No encontre grupos con nombre tipo '01 Fundacion'. Nombres que veo: #{vistos.inspect}"
  puts "Importaste el .dae NUEVO en este modelo? (File > Import)"
end
model.layers.each { |l| puts "  - #{l.name}#{l.visible? ? '' : ' (apagada)'}" if l.name =~ /^\d\d[a-z]? / }
