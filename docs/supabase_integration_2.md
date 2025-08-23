✦ はい、承知いたしました。毎回Googleログインする設計の場合、Googleアカウントとシステム固有のUUIDを連携させるための、非常に一般的で堅
  牢な方法があります。

  キーポイントは「Googleから受け取る `sub` というIDを、ユーザーが初回アクセスした時にだけ保存する」ことです。

  sub (Subject)
  は、Googleが発行するそのユーザーに固有の不変のIDです。これをデータベースに保存し、あなたのシステムのUUIDと紐付けます。

  ---

  連携の具体的なフロー

  ユーザーが「Googleでログイン」ボタンを押した後の、バックエンドでの処理フローは以下のようになります。

   1. 【初回アクセス時】ユーザー登録フロー
   2. 【2回目以降】ログインフロー

  この2つのフローは、JWT内の`sub`がデータベースに存在するかどうかで分岐します。

  図解

    1            +-------------------------+
    2            |  ユーザーがGoogleログイン  |
    3            +-------------+-----------+
    4                          |
    5            (Frontend: GoogleのJWTを取得しBackendへ送信)
    6                          |
    7            +-------------v-----------+
    8            |   Backend: JWTを検証    |
    9            |      ペイロード取得      |
   10            | (sub, email, name...)   |
   11            +-------------+-----------+
   12                          |
   13            +-------------v--------------------------------+
   14            |  DBで `users` テーブルを `sub` をキーに検索  |
   15            |  (SELECT * FROM users WHERE sub = ? )        |
   16            +-------------+--------------------------------+
   17                          |
   18            +-------------v-------------+
   19            |      ユーザーは存在した？     |
   20            +-------------+-------------+
   21                          |
   22            +-------------+---------------------------+
   23            | YES                                     | NO
   24 +----------v----------+                   +----------v----------+
   25 | (既存ユーザー)      |                   | (新規ユーザー)      |
   26 | 1. DBからユーザー情報 |                   | 1. 新しいUUIDを生成   |
   27 |    (UUIDなど)を取得 |                   | 2. `sub`, `email`等と |
   28 | 2. (任意)名前などを更新 |                   |    UUIDをDBに保存   |
   29 | 3. ログイン成功      |                   |    (INSERT)         |
   30 +---------------------+                   | 3. ログイン成功      |
   31                                           +---------------------+
   32                          |
   33            +-------------v-------------+
   34            | Backend: 自社サービスの   |
   35            | セッショントークンを発行  |
   36            | (内部UUIDを含む)し、      |
   37            | Frontendへ返す            |
   38            +---------------------------+

  ---

  実装のステップ（バックエンドの視点）

  以下は、バックエンドがJWTを受け取ってから行う処理の擬似コードです。

    1 // Express.jsなどのフレームワークを想定
    2 
    3 async function handleGoogleLogin(googleJwt: string) {
    4 
    5   // 1. GoogleのJWTを検証し、ペイロード(claims)を取得
    6   const payload = await verifyAndDecodeGoogleJwt(googleJwt);
    7   const googleSub = payload.sub; // これがGoogleの不変ID
    8   const userEmail = payload.email;
    9   const userName = payload.name;
   10 
   11   // 2. DBで `sub` を持つユーザーを検索
   12   let user = await db.users.findUnique({
   13     where: { sub: googleSub }
   14   });
   15 
   16   // 3. ユーザーが存在するかどうかで処理を分岐
   17   if (user) {
   18     // 3a. 【既存ユーザー】の場合
   19     // DBにユーザーが存在したので、そのユーザーとしてログイン処理を進める
   20     console.log(`既存ユーザーがログインしました: ${user.email}, UUID: ${user.id}`);
   21 
   22     // (任意) Googleプロフィールでの変更を反映させる
   23     user = await db.users.update({
   24       where: { id: user.id },
   25       data: { name: userName, email: userEmail } // emailも更新対象にするかは要件次第
   26     });
   27 
   28   } else {
   29     // 3b. 【新規ユーザー】の場合
   30     // DBにユーザーが存在しないので、新しいユーザーとして登録する
   31     console.log(`新規ユーザーを登録します: ${userEmail}`);
   32 
   33     // 新しいUUIDを生成し、Googleの情報を紐付けてDBに保存
   34     user = await db.users.create({
   35       data: {
   36         // id: UUIDはDBが自動生成することが多い
   37         sub: googleSub,
   38         email: userEmail,
   39         name: userName,
   40       }
   41     });
   42   }
   43 
   44   // 4. 自社サービスのセッションを確立
   45   // ユーザーの内部ID(UUID)を含んだ自社独自のJWTやセッショントークンを発行して返す
   46   const ourServiceToken = createOurServiceSessionToken({ userId: user.id });
   47 
   48   return { token: ourServiceToken };
   49 }

  この設計のメリット

   * 安定性: ユーザーがGoogle側でメールアドレスを変更しても、subは変わらないため、アカウントの紐付けが壊れません。
   * 疎結合: あなたのシステムの内部ロジックは、GoogleのID（sub）ではなく、自システムのUUIDに依存させることができます。例えば、将来的
     にGoogle以外のログイン（Apple, etc.）を追加する場合も、usersテーブルのid (UUID)は共通で使えるため、拡張が容易です。
   * セキュリティ: ログインの都度、Googleの認証に頼るため、自前でパスワードを管理する必要がなく、安全です。