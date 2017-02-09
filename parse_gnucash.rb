def handle_node(node)
  if node.element?
    puts "Element"
    puts node.name
  elsif node.text?
    puts "Text"
    puts node.content
  else
    puts "Unknown, name: #{node.name}"
    puts node.to_s
  end

  if node.name == 'account'
    puts "ACCOUNT"
    puts node
    puts node.xpath('act:name')[0].content
  elsif node.name == 'transaction'
    puts "TRANSACTION"
    puts node
  else
    puts " #{node.name}"
  end
end

def wash_name(name)
  washed = name.gsub('-', '_')
  if washed == 'type'
    washed = 'type_'
  elsif washed == 'id'
    washed = 'id_'
  end
  return washed
end
  
def node_to_db(node, make_object = true)
  puts "Handling new node #{node.name.capitalize}"
  attributes = {}
  reference_from = []
  node.children.each do |xp|
    if xp.element?
      xp_name = wash_name(xp.name)
        
      if xp.children.size == 1
        attributes[xp_name] = xp.children[0].to_s
      elsif xp.children.size == 0
        # Do nothing
      elsif xp_name[-1] == 's' # List of objects
        puts "Handling list of objects #{xp.name}"
        xp.children.each do |child|
          if child.element?
            reference_from.append(node_to_db(child))
          end
        end
      else # Single object
        puts "Handling single object #{xp.name}"
        child_data = node_to_db(xp, false)
        puts child_data.inspect
        child_data[:attributes].each do |key, value|
          attributes[xp_name + '_' + key] = value
        end
        puts attributes.inspect
      end
    end
  end

  if make_object
    node_name = wash_name(node.name)
    model_name = node_name.titleize.delete(' ')
    puts model_name
    puts attributes

    obj = model_name.constantize.create(attributes)
    puts obj.inspect
  end

  return { attributes: attributes,
           reference_from: reference_from }
end


doc = Nokogiri::XML(File.open('/home/media/misc/src/rails/economia/ekonomi.xml'))

count = {}

['book'].each do |t|
  count[t] = doc.xpath("gnc-v2/gnc:count-data[@cd:type='#{t}']/text()").to_s.to_i
end
puts count.inspect

for i in 1..count['book']
  book = doc.xpath("gnc-v2/gnc:book[#{i}]")
  types = ['commodity', 'account', 'transaction', 'price']
  types.each do |t|
    count = book.xpath("gnc:count-data[@cd:type='#{t}']/text()").to_s.to_i
    puts "============================="
    puts "Number of #{t}: #{count}"

    for ti in 1..count
      puts "#{t} #{ti}"
      if t == 'price'
        node = book.xpath("gnc:pricedb/price[#{ti}]")
      else
        node = book.xpath("gnc:#{t}[#{ti}]")
      end
      puts node
      node_to_db(node[0])
    end
  end
end


# puts "================"
# ['gnc-v2', 'gnc-v2/gnc:count-data', 'gnc-v2/gnc:book'].each do |xp|
#   puts "Checking #{xp}"
#   doc.xpath(xp).each do |row|
#     puts row.name
#     row.children.each do |child|
#       handle_node(child)
#     end
#   end
#   puts "Checked #{xp}"
#   puts "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%"
# end
