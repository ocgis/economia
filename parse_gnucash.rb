def wash_attribute_name(name)
  washed = name.gsub('-', '_')
  if washed == 'type'
    washed = 'type_'
  elsif washed == 'account'
    washed = 'account_id'
  elsif washed == 'parent'
    washed = 'parent_id'
  end
  return washed
end
  
def wash_model_name(name)
  washed = name.gsub('-', '_')
  if washed == 'transaction'
    washed = 'etransaction'
  end
  return washed
end

def node_to_db(node, make_object = true)
  node_name = node.name.capitalize
  attributes = {}
  reference_from = {}
  node.children.each do |xp|
    if xp.element?
      xp_name = wash_attribute_name(xp.name)
        
      if xp.children.size == 1
        attributes[xp_name] = xp.children[0].to_s
        if ['value', 'quantity'].include? xp_name
          parts = xp.children[0].to_s.split('/')
          if parts.size == 2
            attributes[xp_name] = BigDecimal(parts[0]) / BigDecimal(parts[1])
          end
        end
        if xp.attributes['type'].to_s == 'guid'
          uuid = attributes[xp_name]
          attributes[xp_name] = [uuid[0..7], uuid[8..11], uuid[12..15], uuid[16..19], uuid[20..31]].join('-')
        end

      elsif xp.children.size == 0
        # Do nothing
      elsif xp_name[-1] == 's' # List of objects
        reference_from[xp_name] = []
        xp.children.each do |child|
          if child.element?
            reference_from[xp_name].append(node_to_db(child, false))
          end
        end
      else # Single object
        child_data = node_to_db(xp, false)
        child_data[:attributes].each do |key, value|
          attributes[xp_name + '_' + key] = value
        end
      end
    end
  end

  if node_name == 'Commodity'
    attributes['id'] = [attributes['id'], attributes['space']]
    attributes.delete('space')
  end

  if make_object
    node_name = wash_model_name(node.name)
    model_name = node_name.titleize.delete(' ')

    obj = model_name.constantize.new(attributes)
    reference_from.each do |key, vals|
      vals.each do |val|
        obj.send(key).build(val[:attributes])
      end
    end
    return obj
  else
    return { attributes: attributes,
             reference_from: reference_from }
  end
end


doc = Nokogiri::XML(File.open('/home/media/misc/src/rails/economia/ekonomi.xml'))

count = {}

['book'].each do |t|
  count[t] = doc.xpath("gnc-v2/gnc:count-data[@cd:type='#{t}']/text()").to_s.to_i
end

for i in 1..count['book']
  book = doc.xpath("gnc-v2/gnc:book[#{i}]")
  types = ['commodity', 'account', 'transaction', 'price']
  types.each do |t|
    count = book.xpath("gnc:count-data[@cd:type='#{t}']/text()").to_s.to_i
    puts "============================="
    puts "Number of #{t}: #{count}"

    objects = []
    for ti in 1..count
      if t == 'price'
        node = book.xpath("gnc:pricedb/price[#{ti}]")
      else
        node = book.xpath("gnc:#{t}[#{ti}]")
      end
      objects.append(node_to_db(node[0]))
    end

    puts "importing #{t} objects"
    wash_model_name(t).titleize.constantize.import objects, recursive: true
  end
end
