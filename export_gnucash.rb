def wash_model_name(name)
  washed = name.gsub('-', '_')
  if washed == 'transaction'
    washed = 'etransaction'
  end
  return washed
end

def list_commodities(xml, commodities)
  version = '2.0.0'
  ns = 'cmdty'
  Commodity.all.each do |record|
    xml['gnc'].commodity(version: version) do
      attributes = record.attributes
      keys = ['space', 'id', 'name', 'xcode', 'fraction', 'get_quotes', 'quote_source', 'quote_tz']
      keys.each do |key|
        value = attributes[key]
        if not value.nil?
          xml[ns].send(key) do
            xml.text(value)
          end
        end
      end
    end
  end
end


def list_prices(xml, prices)
  version = '1'
  ns = 'price'
  xml['gnc'].pricedb(version: version) do
    prices.each do |record|
      keep_ns = xml.parent.namespace
      xml.parent.namespace = nil
      xml.price do
        attributes = record.attributes
        xml[ns].id(type: 'guid') do
          xml.text(attributes['id'].split('-').join(''))
        end
        xml[ns].commodity do
          xml['cmdty'].space(record.commodity.space)
          xml['cmdty'].id(record.commodity.id)
        end
        xml[ns].currency do
          xml['cmdty'].space(record.currency.space)
          xml['cmdty'].id(record.currency.id)
        end
        xml[ns].time do
          xml['ts'].date(attributes['time'].strftime('%F %T %z'))
        end
        xml[ns].source(attributes['source'])
        xml[ns].value(attributes['value'].to_i.to_s + '/1')
      end
      xml.parent.namespace = keep_ns
    end
  end
end


def list_accounts(xml, accounts)
  version = '2.0.0'
  ns = 'act'
  accounts.each do |record|
    xml.account(version: version) do
      attributes = record.attributes
      xml[ns].name(attributes['name'])
      xml[ns].id(type: 'guid') do
        xml.text(attributes['id'].split('-').join(''))
      end
      xml[ns].type(attributes['type_'])
      if not record.commodity.nil?
        xml[ns].commodity do
          xml['cmdty'].space(record.commodity.space)
          xml['cmdty'].id(record.commodity.id)
        end
      end
      if not attributes['commodity_scu'].nil?
        xml[ns].send('commodity-scu', attributes['commodity_scu'])        
      end
      if not attributes['code'].nil?
        xml[ns].code(attributes['code'])        
      end
      if not attributes['description'].nil?
        xml[ns].description(attributes['description'])        
      end
      if record.slots.count > 0
        xml[ns].slots do
          keep_ns = xml.parent.namespace
          xml.parent.namespace = nil
          record.slots.each do |slot|
            list_slot(xml, slot)
          end
        xml.parent.namespace = keep_ns
        end
      end
      if not record.account_parent.nil?
        xml[ns].parent_(type: 'guid') do
          xml.text(record.account_parent.id.split('-').join(''))
        end
      end
    end
  end
end


def list_transactions(xml, etransactions)
  version = '2.0.0'
  ns = 'trn'
  etransactions.each do |record|
    xml.transaction(version: version) do
      attributes = record.attributes
      xml[ns].id(type: 'guid') do
        xml.text(attributes['id'].split('-').join(''))
      end
      if not record.currency.nil?
        xml[ns].currency do
          xml['cmdty'].space(record.currency.space)
          xml['cmdty'].id(record.currency.id)
        end
      end
      if not attributes['num'].nil?
        xml[ns].num(attributes['num'])        
      end
      xml[ns].send('date-posted') do
        xml['ts'].date(record.date_posted.strftime('%F %T %z'))
      end
      xml[ns].send('date-entered') do
        xml['ts'].date(record.updated_at.strftime('%F %T %z'))
      end
      if not attributes['description'].nil?
        xml[ns].description(attributes['description'])        
      end
      if record.slots.count > 0
        xml[ns].slots do
          keep_ns = xml.parent.namespace
          xml.parent.namespace = nil
          record.slots.each do |slot|
            list_slot(xml, slot)
          end
        xml.parent.namespace = keep_ns
        end
      end
      if record.splits.count > 0
        xml[ns].splits do
          record.splits.each do |split|
            xml[ns].split do
              attributes = split.attributes
              xml['split'].id(type: 'guid') do
                xml.text(attributes['id'].split('-').join(''))
              end
              if not split.memo.nil?
                xml['split'].memo(split.memo)
              end
              if not split.action.nil?
                xml['split'].action(split.action)
              end
              xml['split'].send('reconciled-state') do
                xml.text(split.reconciled_state)
              end
              if not split.reconcile_date.nil?
                xml['split'].send('reconcile-date') do
                  xml['ts'].date(split.reconcile_date.strftime('%F %T %z'))
                end
              end
              xml['split'].value((split.value * 100).to_i.to_s + '/100')
              xml['split'].quantity((split.quantity * 100).to_i.to_s + '/100')
              xml['split'].account(type: 'guid') do
                xml.text(split.account_id.split('-').join(''))
              end
            end
          end
        end
      end
    end
  end
end


def list_slot(xml, slot)
  xml.slot do
    xml['slot'].key do
      xml.text(slot.key)
    end
    if not slot.value_integer.nil?
      xml['slot'].value(type: 'integer') do
        xml.text(slot.value_integer)
      end
    end
    if not slot.value_string.nil?
      xml['slot'].value(type: 'string') do
        xml.text(slot.value_string)
      end
    end
    if not slot.value_gdate.nil?
      xml['slot'].value(type: 'gdate') do
        keep_ns = xml.parent.namespace
        xml.parent.namespace = nil        
        xml.gdate(slot.value_gdate.to_s)
        xml.parent.namespace = keep_ns
      end
    end
    if slot.value_frame.length > 0
      xml['slot'].value(type: 'frame') do
        keep_ns = xml.parent.namespace
        xml.parent.namespace = nil
        slot.value_frame.each do |child|
          list_slot(xml, child)
        end
        xml.parent.namespace = keep_ns
      end
    end
  end
end


version = '2.0.0'

doc = Nokogiri::XML::Builder.new(:encoding => 'utf-8') do |xml|
  xml.send('gnc-v2',
           'xmlns:gnc' => 'http://www.gnucash.org/XML/gnc',
           'xmlns:act' => 'http://www.gnucash.org/XML/act',
           'xmlns:book' => 'http://www.gnucash.org/XML/book',
           'xmlns:cd' => 'http://www.gnucash.org/XML/cd',
           'xmlns:cmdty' => 'http://www.gnucash.org/XML/cmdty',
           'xmlns:price' => 'http://www.gnucash.org/XML/price',
           'xmlns:slot' => 'http://www.gnucash.org/XML/slot',
           'xmlns:split' => 'http://www.gnucash.org/XML/split',
           'xmlns:sx' => 'http://www.gnucash.org/XML/sx',
           'xmlns:trn' => 'http://www.gnucash.org/XML/trn',
           'xmlns:ts' => 'http://www.gnucash.org/XML/ts',
           'xmlns:fs' => 'http://www.gnucash.org/XML/fs',
           'xmlns:bgt' => 'http://www.gnucash.org/XML/bgt',
           'xmlns:recurrence' => 'http://www.gnucash.org/XML/recurrence',
           'xmlns:lot' => 'http://www.gnucash.org/XML/lot',
           'xmlns:addr' => 'http://www.gnucash.org/XML/addr',
           'xmlns:billterm' => 'http://www.gnucash.org/XML/billterm',
           'xmlns:bt-days' => 'http://www.gnucash.org/XML/bt-days',
           'xmlns:bt-prox' => 'http://www.gnucash.org/XML/bt-prox',
           'xmlns:cust' => 'http://www.gnucash.org/XML/cust',
           'xmlns:employee' => 'http://www.gnucash.org/XML/employee',
           'xmlns:entry' => 'http://www.gnucash.org/XML/entry',
           'xmlns:invoice' => 'http://www.gnucash.org/XML/invoice',
           'xmlns:job' => 'http://www.gnucash.org/XML/job',
           'xmlns:order' => 'http://www.gnucash.org/XML/order',
           'xmlns:owner' => 'http://www.gnucash.org/XML/owner',
           'xmlns:taxtable' => 'http://www.gnucash.org/XML/taxtable',
           'xmlns:tte' => 'http://www.gnucash.org/XML/tte',
           'xmlns:vendor' => 'http://www.gnucash.org/XML/vendor') do
    xml['gnc'].send('count-data',
                    'cd:type' => 'book') do
      xml.text(Book.all.count)
    end
    Book.find_each do |book|
      xml['gnc'].book(version: version) do
        xml['book'].id(type: 'guid') do
          xml.text(book.id.split('-').join(''))
        end
 
        xml['book'].slots do
          keep_ns = xml.parent.namespace
          xml.parent.namespace = nil
          book.slots.find_each do |slot|
            list_slot(xml, slot)
          end
          xml.parent.namespace = keep_ns
        end

        models = ['commodity', 'account', 'transaction', 'price']
        models.each do |model|
          count = wash_model_name(model).titleize.constantize.count
          xml['gnc'].send('count-data',
                          'cd:type' => model) do
            if model == 'commodity'
              count = count - 1
            end
            xml.text(count)
          end
        end

        list_commodities(xml, book.commodities)
        list_prices(xml, book.prices)
        list_accounts(xml, book.accounts)
        list_transactions(xml, book.etransactions)
      end
    end
  end
end


puts doc.to_xml
