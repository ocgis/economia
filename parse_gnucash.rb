require 'pp'

def wash_attribute_name(name)
  washed = name.gsub('-', '_')
  if washed == 'type'
    washed = 'type_'
  elsif washed == 'id_guid'
    washed = 'id'
  elsif washed == 'account_guid'
    washed = 'account_id'
  elsif washed == 'parent_guid'
    washed = 'parent_id'
  elsif washed == 'date_entered'
    washed = 'updated_at'
  elsif washed == 'value_frame_slot'
    washed = 'value_frame'
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
  begin
    node_name = node.name.capitalize
  rescue
    PP.pp(node)
  end
  attributes = {}
  reference_from = {}
  node.children.each do |xp|
    if xp.element?
      if xp.attributes['type'].nil?
        xp_name = xp.name
      else
        xp_name = xp.name + '_' + xp.attributes['type']
      end

      xp_name = wash_attribute_name(xp_name)

      if node_name == 'Book' and ['commodity', 'account', 'transaction'].include? xp_name
        collection = wash_model_name(xp_name).pluralize
        if reference_from[collection].nil?
          reference_from[collection] = []
        end
        reference_from[collection].append(node_to_db(xp, true))
      elsif node_name == 'Book' and xp_name == 'pricedb'
        xp.children.each do |child|
          if child.element?
            child_name = wash_attribute_name(child.name)
            collection = child_name.pluralize
            if reference_from[collection].nil?
              reference_from[collection] = []
            end
            reference_from[collection].append(node_to_db(child, true))
          end
        end
      elsif node_name == 'Book' and xp_name.start_with? 'count_data'
        # Ignore
      elsif xp.children.size == 1
        attributes[xp_name] = xp.children[0].text.to_s
        if attributes[xp_name].nil?
          attributes[xp_name] = ''
        end
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
        attributes[xp_name] = ''
      elsif xp_name[-1] == 's' or xp_name == 'value_frame' # List of objects
        reference_from[xp_name] = []
        xp.children.each do |child|
          if child.element?
            reference_from[xp_name].append(node_to_db(child, true))
          end
        end
      else # Single object
        child_data = node_to_db(xp, false)
        child_data[:attributes].each do |key, value|
          if ['date', 'gdate'].include? key
            attr_name = xp_name
          else
            attr_name = wash_attribute_name(xp_name + '_' + key)
          end
          attributes[attr_name] = value
        end
        child_data[:reference_from].each do |key, value|
          name = wash_attribute_name(xp_name + '_' + key)
          reference_from[name] = value
        end
      end
    end
  end

  if make_object
    node_name = wash_model_name(node.name)
    model_name = node_name.titleize.delete(' ')

    obj = model_name.constantize.new(attributes)
    reference_from.each do |key, vals|
      vals.each do |val|
        obj.send(key) << val
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
  objects = []

  book = doc.xpath("gnc-v2/gnc:book[#{i}]")
  objects.append(node_to_db(book[0]))
  puts "importing book objects"
  Book.import objects, recursive: true
end
