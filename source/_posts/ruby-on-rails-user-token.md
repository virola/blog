title: ruby on rails使用HTTP认证token实现用户登录验证和会话保持
date: 2018-05-10 23:48:51
tags:
- ruby on rails
category:
- 前端
---

## 增加认证(Authentication)

认证的过程是这样的: 用户把用户名和密码通过 HTTP POST 请求发送到我们的 API (在这里我们使用 sessions 端点来处理这个请求), 如果用户名和密码匹配，我们会把 `token` 发送给用户。 这个 token 就是用来证明用户身份的凭证。然后在以后的每个请求中，我们都通过这个 token 来查找用户，如果没有找到用户则返回 401 错误。

### 给 Member 模型增加 authentication_token 属性

```shell
$ rails g migration add_authentication_token_to_members
```

db/migrate/20180510152021_add_authentication_token_to_members.rb :

```ruby
class AddAuthenticationTokenToMembers < ActiveRecord::Migration
  def change
    add_column :members, :authentication_token, :string
  end
end
```
$ rake db:migrate

### 生成 authentication_token

app/models/member.rb,
```ruby
class Member < ActiveRecord::Base

   before_create :generate_authentication_token

   def generate_authentication_token
     loop do
       self.authentication_token = SecureRandom.base64(64)
       break if !Member.find_by(authentication_token: authentication_token)
     end
   end

   def reset_auth_token!
     generate_authentication_token
     save
   end

end
```
这里给 Member 模型增加了一个 `reset_auth_token!` 方法，这样做的理由主要有以下几点:
- 需要有一个方法帮助用户重置 authentication token, 而不仅仅是在创建用户时生成 authenticeation token；
- 如果用户的 token 被泄漏了，我们可以通过 reset_auth_token! 方法方便地重置用户 token ；

### sessions endpoint

生成 sessions 控制器

```shell
# 我们不需要生成资源文件
$ rails g controller api/v1/sessions --no-assets

  create  app/controllers/api/v1/sessions_controller.rb
  invoke  erb
  create    app/views/api/v1/sessions
  invoke  test_unit
  create    test/controllers/api/v1/sessions_controller_test.rb
  invoke  helper
  create    app/helpers/api/v1/sessions_helper.rb
  invoke    test_unit
```

app/controllers/api/v1/sessions_controller.rb

``` ruby
class Api::V1::SessionsController < Api::V1::BaseController

  def create
    @member = Member.find_by(username: create_params[:username]).authenticate(create_params[:password])
    if @member
      self.current_member = @member
    else
      api_error(status: 401)
    end
  end

  private

  def create_params
    params.require(:member).permit(:username, :open_id, :password)
  end
end

```
实现 api_error 和 current_member 方法

app/controllers/api/v1/base_controller.rb :

```ruby
class Api::V1::BaseController < ApplicationController

  attr_accessor :current_member

  def api_error(opts = {})
    render nothing: true, status: opts[:status]
  end
end
```
现在还需要做一些额外工作:
- 给 Member 模型增加密码验证，整理数据库，给数据库中已存在的测试用户增加相关字段;
- 实现 app/views/api/v1/sessions/create.json.jbuilder;
- 配置和 sessions 相关的路由;

### 给 Member 模型增加密码验证，整理数据库

在 Gemfile 里将 gem 'bcrypt' 这一行的注释取消

```yaml
# Use ActiveModel has_secure_password
gem 'bcrypt', '~> 3.1.7'
```

app/models/member.rb :

```ruby
class Member < ActiveRecord::Base
    has_secure_password
end
```

给 Member 模型增加 `password_digest` 属性:

```shell
$ rails g migration add_password_digest_to_members
```

db/migrate/20180510153029_add_password_digest_to_members.rb :

```ruby
class AddPasswordDigestToMembers < ActiveRecord::Migration
  def change
    add_column :members, :password_digest, :string
  end
end
```

执行：
```
$ bundle install
$ rake db:migrate
```

整理之前的用户数据。给数据库中已存在的测试用户增加 password 和 authentication token，这个任务可以在 rails console 下完成。

首先启动 rails console ：

$ rails c

然后在 rails console 里执行：
```ruby
Member.all.each {|member|
  member.password = '123123'
  member.reset_auth_token!
}
```

### 实现 app/views/api/v1/sessions/create.json.jbuilder

app/views/api/v1/sessions/create.json.jbuilder :
```ruby
if @member
  json.session do
    json.(@member, :id, :username, :nickname, :role)
    json.token @member.authentication_token
  end
end
```

### 配置和 sessions 相关的路由
```ruby
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
       resources :sessions, only: [:create]
    end
  end
end
```

现在做一个测试看是否能够顺利地拿到用户的 token, 我们使用下面的用户作为测试用户:
```
{
  username: '222'
}
```

浏览器console执行:

```javascript
# ajax request
$.post('/api/v1/sessions.json', 'member[username]=222&member[password]=123123');
```
```json
{"session":{"id":2,"username":"222","nickname":"222333","role":"admin","token":"ji14ZeekYZCtJ0tShU88rgQuRsym/XEOnO+01SjWr94DXYzSlIoKzuBQUYmvnxrcHNGgNuqX+ey/1jKkgx0jrg=="}}
```
顺利地拿到了 token。我们再做一个验证失败的测试，使用一个错误的密码: fakepwd

```
curl -i -X POST -d "member[username]=222&member[password]=fakepwd" http://localhost:3000/api/v1/sessions.json
```

```javascript
# ajax request
$.post('/api/v1/sessions.json', 'member[username]=222&member[password]=fakepwd');
```

```
HTTP/1.1 401 Unauthorized
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
X-Download-Options: noopen
X-Permitted-Cross-Domain-Policies: none
Referrer-Policy: strict-origin-when-cross-origin
Content-Type: application/json; charset=utf-8
Cache-Control: no-cache
X-Request-Id: 41934010-eb83-4216-82a6-4cf42ad8fc4e
X-Runtime: 0.136374
Vary: Origin
Transfer-Encoding: chunked

{}% 
```
此时服务器返回了 401 Unauthorized

## Authenticate Member
在前面的测试中，我们已经成功地拿到了用户的 token, 那么现在我们把 token 和 username 发给 API，看能否成功识别出用户。
首先在 `Api::V1::BaseController` 里实现 `authenticate_member!` 方法:

app/controllers/api/v1/base_controller.rb,
```ruby
class Api::V1::BaseController < ApplicationController

  #...

  def authenticate_member!
    token, options = ActionController::HttpAuthentication::Token.token_and_options(request)

    member_username = options.blank?? nil : options[:username]
    member = member_username && Member.find_by(username: member_username)

    if member && ActiveSupport::SecurityUtils.secure_compare(member.authentication_token, token)
      self.current_member = member
    else
      return unauthenticated!
    end
  end

  def unauthenticated!
    api_error(status: 401)
  end

end
```

`ActionController::HttpAuthentication::Token` 是 rails 自带的方法，可以参考 rails 文档 了解其详情。

这里通过 `member_username` 拿到 `member` ，然后通过 `ActiveSupport::SecurityUtils.secure_compare` 对 `member.authentication_token` 和从请求头里取到的 token 进行比较，如果匹配则认证成功，否则返回 `unauthenticated!` 。这里使用了 `secure_compare` 对字符串进行比较，是为了防止时序攻击(timing attack)

我们构造一个测试用例, 这个测试用例包括以下一些步骤:
+ 用户登录成功, 服务端返回其 username, token 等数据
+ 用户请求 API 更新其 nickname, 用户发送的 token 合法, 更新成功
+ 用户请求 API 更新其 nickname, 用户发送的 token 非法, 更新失败

为了让用户能够更新其 nickname, 我们需要实现 member `update` API, 并且加入用户验证 `before_action`

app/controllers/api/v1/members_controller.rb,
```ruby
class Api::V1::MembersController < Api::V1::BaseController

  before_action :authenticate_member!, only: [:update]

  def update
    @member = Member.find(params[:id])
    @member.update_attributes(update_params)
  end

  private

  def update_params
    params.require(:member).permit(:nickname)
  end

end
```

app/views/api/v1/members/update.json.jbuilder,
```ruby
json.member do
  json.(@member, :id, :username, :nickname)
end
```
现在我们进行测试, 测试用户是:
```
{
  id: 2,
  username: '222',
  nickname: '222233',
  authentication_token: 'ji14ZeekYZCtJ0tShU88rgQuRsym/XEOnO+01SjWr94DXYzSlIoKzuBQUYmvnxrcHNGgNuqX+ey/1jKkgx0jrg=='
}
```

```
$ curl -i -X PUT -d "member[nickname]=new-member" \
  --header "Authorization: Token token=ji14ZeekYZCtJ0tShU88rgQuRsym/XEOnO+01SjWr94DXYzSlIoKzuBQUYmvnxrcHNGgNuqX+ey/1jKkgx0jrg==, \
  username=222" \
  http://localhost:3000/api/v1/members/2

# result
{"member":{"id":2,"username":"222","nickname":"hello2"}}
```

我们看到 member nickname 已经成功更新。

**请注意: 你们自己测试时需要将 token 换为你们自己生成的 token。**

我们使用一个非法的 token 去请求 API, 看看会发生什么状况。

```
$ curl -i -X PUT -d "member[nickname]=new-member" \
  --header "Authorization: Token token=faketoken, \
  username=222" \
  http://localhost:3000/api/v1/members/2

# result
HTTP/1.1 401 Unauthorized
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
X-Download-Options: noopen
X-Permitted-Cross-Domain-Policies: none
Referrer-Policy: strict-origin-when-cross-origin
Content-Type: application/json; charset=utf-8
Cache-Control: no-cache
X-Request-Id: 5d6c11fd-9e05-439f-848a-259b24e183dd
X-Runtime: 0.164683
Vary: Origin
Transfer-Encoding: chunked
``` 
服务器返回 401 Unauthorized, 并且 member nickname 没有被更新。
