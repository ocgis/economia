Rails.application.routes.draw do
  devise_for :users, :controllers => { :omniauth_callbacks => "users/omniauth_callbacks" }
  get 'summary' => 'summary#index'

  namespace :api do
    namespace :v1 do
      resources :etransactions, only: [:show, :update, :new, :index]
    end
  end

  resources :etransactions, except: [:show, :new, :index]
  put 'etransactions/:id/add_split' => 'etransactions#add_split', :as => :add_split_etransaction
  post 'etransactions/:id/update_data' => 'etransactions#update_data', :as => :update_data_etransaction
  delete 'etransactions/:id/destroy_split' => 'etransactions#destroy_split', :as => :destroy_split_etransaction

  resources :slots
  resources :commodities
  resources :prices
  resources :splits

  resources :accounts
  get 'accounts/index'
  get 'accounts/show'

  resources :root, only: [:index] do
    collection do
      get 'error'
    end
  end

  root 'root#index'
  get '/*path' => 'root#index'

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

end
