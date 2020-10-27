class User < ApplicationRecord

  include RoleModel

  roles :admin

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  devise :omniauthable, :omniauth_providers => [:facebook]

  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.email = auth.info.email
      user.password = Devise.friendly_token[0,20]

      user.save!

      # Make the first user admin
      if user.id == 1
        user.roles << :admin
        user.save!
      end
    end      
  end
end
