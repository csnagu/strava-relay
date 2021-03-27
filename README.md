# integrate strava with jira cloud

strava に記録したアクティビティログを日毎に集計して Jira のチケットとしてアクティブなスプリントへ追加する。  
運動をしていたのであって決して遊んでてコミットライン達成率が100%いかなかったわけじゃないので✋

## つかいかた
1. `.env` に必要な情報を入力する
2. cronで毎日0時過ぎにスクリプトを叩くようにする

## とらぶるしゅーと
### Stravaトークンの有効期限が切れた
1. https://www.strava.com/settings/api へアクセス
2. OAuthページへ飛ぶ
3. URLに `&scope=activity:read` をつけてページ遷移する
4. URL部の `code` パラメータの値をもとにトークンを再発行する
    ref: https://developers.strava.com/docs/authentication/
5. refresh_tokenを `.env` に入力する

## イケてないところ
- `.env` でアカウント情報を管理してる 🤮
- `.env` をスクリプト側で書き換えてる 😫
- 毎日cron叩かないと使い物にならん
- トークンの再発行手続きが機械的にできそう
