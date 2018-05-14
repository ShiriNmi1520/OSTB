The package.json under VueSocketIO is for heroku deploy
If you want run 'npm install' command (Add package, or something...)
Please `cd server`
    then `npm install`
Do not run `npm install` under VueSocketIO

Ps:If you've added package or upadted,
   please make sure package.json under VueSocketIO is complete same as /server/package.json.(You can just copy file to rewrite),
   or the server on heroku may not run as properly

Thanks
    Y.C.Huang

VueSocketIO 底下的package.json是給heroku進行部屬的
如果有需要執行到npm install (新增套件或者什麼的...)
請將路徑指到server底下再執行
不要在VueSocketIO底下執行

Ps:如果你對專案有進行新增、刪除、更新套件
    麻煩請確認VueSocketIO底下的package.json和/server/package.json兩個是一致的(你大可直接複製過來)
    否則無法確認伺服器會如你想像的執行

感謝
    Y.C.Huang