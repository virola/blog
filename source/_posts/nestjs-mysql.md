title: Nest.js连接mysql数据库及查询的配置
date: 2019-07-15 11:28:52
tags:
- nodejs
- nestjs
category: 
- 前端
---


## 数据库配置

nest.js 使用内置的 `TypeORM` 数据库处理模块，它为许多不同的数据库提供支持，不仅有 MySQL 。

> 我们选择了TypeORM，因为它绝对是迄今为止最成熟的对象关系映射器（ORM）。

使用时：

```bash
npm install --save @nestjs/typeorm typeorm mysql
```

安装完成后，在 app.module.ts 中加入数据库配置：

```js
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
  ],
})
export class ApplicationModule {}
```

另外，也可以将mysql配置参数写在项目根目录的 `ormconfig.json` 文件中，推荐项目使用这种方法配置数据库连接。

我试了下，用配置文件的方式，发现并没有用，可能还差了什么配置漏掉了吧。目前直接写在 app.module 中的方式是可以正确连接的。

<!-- more -->

## 编写数据库模型

### 1、定义数据库实体 entity 

mysql数据库的连接方式在前面已经说明，这里不赘述。

设定数据库中已存在消息表 `message`，需要程序中对应定义一个 `message.entity.ts` 。

Ps. nest.js中，数据库实体命名用**名词单数**，service、controller、module的命名用**名词复数**。

```js
// messages/message.entity.ts
import { Column, Entity, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

// 这里可以修改表名
// @Entity('messages')
@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column('text', { name: 'content' })
  content: string;

  @Column('int', { name: 'to_user_id' })
  toUserId: number;

  @Column('datetime', { name: 'created_time' })
  createdTime: Date;

  @Column('int')
  creator: number;

  @Column('datetime', { name: 'updated_time' })
  updatedTime: Date;

  @Column('int')
  updator: number;
}


```

在项目实践时发现一个问题，定义了entity的字段之后，程序启动时会**自动同步给数据库表结构**，包括字段命名都会更改。因此在定义数据库实体的时候**注意不要遗漏了字段**。

这个同步的选项应该是可以定义的，应该是最开始定义的数据库连接参数中的 `synchronize` 这个字段设置成 `true` 的缘故。

### 2、 定义service模块数据处理

在 `messages.service.ts` 中，将ORM相关处理逻辑加进来：

```js
import { Injectable } from '@nestjs/common';
import { Message } from './interfaces/message.interface';
// ORM
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
  ) { }

  private readonly messages: Message[] = [];

  async findAll(): Promise<Message[]> {
    return await this.messagesRepository.find();
  }
}

```

### 3、定义controller模块处理逻辑

在 `messages.controller.ts` 中，加入 service 相关处理逻辑，并定义路由：

```js
import { Controller, Get } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Message } from './message.entity';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) { }

  @Get()
  findAll(): Promise<Message[]> {
    return this.messagesService.findAll();
  }
}

```

### 4、定义 module 模块中ORM连接

修改 `messages.module.ts` 文件，加入service、controller 等 ORM相关处理模块：

```js
import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [MessagesService],
  controllers: [MessagesController]
})
export class MessagesModule {}

```

### 5、最后将 MessagesModule 导入到 AppModule 中

```js
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({...}),
    MessagesModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [AppService],
})
export class AppModule {
  constructor(private readonly connection: Connection) { }
}

```

以上步骤全部定义好之后，因为controller中加入了路由，所以这时访问： <http://localhost:3000/messages> 会看到所有数据表中的数据已经按列表形式输出JSON了。


## ActiveRecord 模式的数据模型

使用 ActiveRecord 模式的数据模型来写，代码可以更简洁一点。

### entity定义

继承 `BaseEntity` 基础类。

```js
import { Column, Entity, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  user_id: number;

  @Column('text')
  content: string;

  @Column('int')
  to_user_id: number;

  @Column('datetime')
  created_time: Date;

  @Column('int')
  creator: number;

  @Column('datetime')
  updated_time: Date;

  @Column('int')
  updator: number;
}

```

### 定义service

```js
import { Injectable } from '@nestjs/common';
import { Message } from './message.entity';

@Injectable()
export class MessagesService {

  async save(): Promise<Message> {
    const message = new Message();
    message.user_id = Math.round(Math.random() * 1000);
    message.to_user_id = Math.round(Math.random() * 1000);
    message.content = '消息内容';
    return await message.save();
  }

  async findAll(): Promise<Message[]> {
    return await Message.find();
  }
}

```


## 测试POST请求

GET请求可以直接在浏览器中打开看效果，POST请求就要利用工具实现模拟调用了。

```bash
curl -X POST --data "" http://localhost:3000/messages
```

curl默认以 `application/x-www-form-urlencoded` 作为 `Content-Type` 来发送数据。如果想要用JSON格式发送数据，那么可以通过 -H 参数来修改 Content-Type 。

```bash
curl -H "Content-Type:application/json" -X POST --data '{"user_id": 3000, "to_user_id": 4000, "content": "xxxyyyzzz"}' http://localhost:3000/messages
```
