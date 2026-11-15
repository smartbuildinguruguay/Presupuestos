# SBU - asigna una etiqueta (tag) a cada grupo principal del modelo importado
# Uso: seleccionar el componente importado (o nada, para todo el modelo) y correr este archivo en la consola Ruby.
model = Sketchup.active_model
model.start_operation('Etiquetas SBU', true)
cuenta = 0
recorrer = lambda do |ents|
  ents.each do |e|
    next unless e.respond_to?(:definition)
    nombre = e.name.to_s.empty? ? e.definition.name.to_s : e.name.to_s
    if nombre =~ /^\d\d /
      tag = model.layers[nombre] || model.layers.add(nombre)
      e.layer = tag
      cuenta += 1
    end
    recorrer.call(e.definition.entities)
  end
end
recorrer.call(model.selection.empty? ? model.entities : model.selection)
model.commit_operation
puts "Etiquetas asignadas: #{cuenta}"
model.layers.each { |l| puts "  - #{l.name}" if l.name =~ /^\d\d / }
