

# OSTB 架構介紹

期末項目，實現前後端分離。

## 框架

1. 前端使用的框架
  * vue.js
  * electron
  * bootstrap-vue
  * vueSocket.io
2. 後端
  * firebase
  * express
  * socket.io

## 功能

### 1. 登入： 👌
> 由前端發請求給後端，後端再請求 Firebase 做確認，確認無誤後登入。

### 2. 註冊： 👌
> 由前端發請求給後端，後端再請求 Firebase 做註冊，確認無誤後寫入資料。

### 3. 登出： 👌
> 由前端發請求給後端，後端清空該 socket 有關登入的所有資訊。

### 4. 創建房間： 👌
> 由前端發房間名字（使用者自訂）和使用者 uid 給後端後，後端使用 uid 作為資料庫路徑，往 Firebase 寫入房間資訊，再傳回該房間相關資訊到前端。

### 5. 獲取房間清單： 👌
> 由前端發請求，後端往 Firebase 調用後回傳。

### 6. 加入房間： 👌
> 由前端發使用者 uid 與房間 id 給後端後，後端將該資料往 Firebase 做檢索找到房間，並且使用使用者 uid 調用資料，寫入使用者資訊，再傳回該房間相關資訊到前端。

### 7. 離開房間： 👌
> 由前端發送使用者 uid 與判斷 創建 / 加入房間 所接受到的資訊，判斷有關自己的資訊後，將資料送到後端，後端再到 Firebase 刪除該資訊。

### 8. 進入遊戲：
> 由房主發出開始遊戲的請求，後端接收到之後往這個房間的所有人發送進入遊戲畫面的訊號。再由前端檢查房內所有人的路由是否已進戰鬥畫面，再回傳給後端做判斷。（若有人無法進入戰鬥畫面，將會強制終止遊戲。

### 9. 主持遊戲：
> 後端往 Firebase 紀錄遊戲戰況，有任何變更將立即推送至前端。(血量、手卡數、死亡狀態、身份...所有與遊戲有關的事情都會被記錄。）

### 10. 抽卡片：
> 前端判斷是否是自己的回合，若是的話將往後端發送抽卡請求，後端將再次確認，無誤隨機發送卡片資訊給前端。

### 11. 使用卡片：
> 前端發送卡片ＩＤ給後端，後端將使用結果推送給在房內的所有玩家。

### 12. 已死亡：
> 前端出現選項讓玩家決定是否回到大廳，或可繼續留下來觀戰，若選擇離開大廳，將發請求讓後端從房間移除該使用者。

### 13. 遊戲結束：
> 前端使用路由將玩家全部返回房間畫面，若離開一樣使用第七點提到的離開房間。

### 14. 遊戲內聊天：
>前端傳送使用者資訊、訊息內容給後端，後端發送給該房內所有使用者。

## 使用流程

### 1. 登入

* 前端

  <img src="https://firebasestorage.googleapis.com/v0/b/buyao-70f4a.appspot.com/o/1-a.png?alt=media&token=cad7760c-8be8-4370-97ac-81c0fdffdd2a">

* 後端

    <img src="https://firebasestorage.googleapis.com/v0/b/buyao-70f4a.appspot.com/o/1-b.png?alt=media&token=e33e83ad-f364-4ed6-a4cd-eb6525d9d761">



2. ### 註冊

   * 前端

     <img src="https://firebasestorage.googleapis.com/v0/b/buyao-70f4a.appspot.com/o/2-a.png?alt=media&token=f8fd4fda-7a31-4aed-9010-3710d2b45069">

   * 後端

     <img src="https://firebasestorage.googleapis.com/v0/b/buyao-70f4a.appspot.com/o/2-a.png?alt=media&token=f8fd4fda-7a31-4aed-9010-3710d2b45069">




3. ### 登出

   * 前端

     ```flow
     st=>start: 開始登出
     op=>operation: 清除登入相關資訊
     e=>end: 已登出成功，進入登入畫面

     st->op->e
     ```



   * 後端

     ```flow
     st=>start: 開始登出
     op=>operation: 清除登入相關資訊
     e=>end: 已登出成功

     st->op->e
     ```

4. ### 創建房間

   * 前端

     ```flow
     st=>start: 點擊創建房間按鈕
     op=>operation: 輸入房間資訊
     sub1=>subroutine: 往後端推送房間名稱、個人ＵＩＤ
     e=>end: 接收來自後端的資料，創建成功，路由進入房間畫面。

     st->op->sub1->e
     ```



   * 後端

     ```flow
     st=>start: 收到前端資料，開始創建房間
     op=>operation: 使用前端傳來之房間名、個人ＵＩＤ往 firebase 進行推送
     op2=>operation: 推送成功後，往前端推送房間相關資料。
     e=>end: 已結束

     st->op->op2->e
     ```

5. ### 獲取房間清單

   * 前端

     ```flow
     st=>start: 傳送請求給後端
     e=>end: 已收到資訊，進入房間列表。

     st->e
     ```



   * 後端

     ```flow
     st=>start: 接收前端訊號
     op=>operation: 往 firebase 提取資訊
     e=>end: 發送至前端，結束

     st->op->e
     ```

6. ### 加入房間

   * 前端

     ```flow
     st=>start: 往後端發送請求
     op=>operation: 提取該房間資訊，傳送給後端
     e=>end: 順利加入房間，路由進入房間。

     st->op->e
     ```



   * 後端

     ```flow
     st=>start: 接收前端訊號
     op=>operation: 將前端使用者發送的資訊相對應的，把該使用者推送進房間。
     e=>end: 發送房間資訊至前端，結束

     st->op->e
     ```

7. ### 離開房間

   * 前端

     ```flow
     st=>start: 發送離開訊號至後端
     op=>operation: 將個人資訊推往後端
     e=>end: 成功，路由畫面返回房間列表。

     st->op->e
     ```



   * 後端

     ```flow
     st=>start: 接收前端訊號
     op=>operation: 往 firebase 調用該房間資訊，並且移除使用者
     e=>end: 發送至前端，結束

     st->op->e
     ```

8. ### 進入遊戲：

   * 前端

     ```flow
     st=>start: 由房主點下開始遊戲
     op=>operation: 往後端推送開始訊號
     op1=>operation: 房間全體進入戰鬥路由
     con=>condition: 全體已進入戰鬥路由？
     op2=>operation: 進入遊戲失敗，回到房間路由。
     e=>end: 開始戰鬥
     st->op->op1->con
     con(yes)->e
     con(no)->op2
     ```



   * 後端

     ```flow
     st=>start: 接收房主按下開始遊戲之訊號
     op=>operation: 往 firebase 註記該房間遊戲中，不可加入。
     op1=>operation: 往房內玩家推訊號，使其路由進入戰鬥畫面
     op2=>operation: 往房內玩家推訊號，使其路由進入房間畫面，提供失敗訊息。
     con=>condition: 全體已進戰鬥畫面？
     e=>end: 開始主持遊戲

     st->op->op1->con
     con(yes)->e
     con(no)->op2
     ```



9. ### 主持遊戲

   * 前端

     ```flow
     st=>start: 接收後端訊號
     op1=>operation: 推送戰鬥事件至後端
     e=>end: 有變更資訊立刻更新

     st->op1->e
     ```



   * 後端

     ```flow
     st=>start: 接收前端訊號
     sub=>subroutine: 常駐性的往 firebase 抓取新資訊推往前端
     e=>end: 更新至前端
     st->sub->e
     ```



10. ### 抽卡片

    * 前端

      ```flow
      con=>condition: 是自己的回合？
      st=>start: 自己的回合開始
      op=>operation: 往後端發送抽卡訊號
      e=>end: 接受後端發送回來之卡片資訊
      sub=>subroutine: 接收到該回合之玩家的手牌+1
      con(yes)->st->op->e
      con(no)->sub->e
      ```



    * 後端

      ```flow
      st=>start: 接收前端訊號
      op=>operation: 隨機發送攻擊/防禦之卡片至該回合擁有者
      op1=>operation: 往 firebase 推送玩家手卡資料
      e=>end: 往 firebase 調取戰況，即時更新給所有玩家

      st->op->op1->e
      ```



11. ### 使用卡片

    * 前端

      ```flow
      st=>start: 接收前端訊號
      con1=>condition: 卡片使用者？
      con2=>condition: 被攻擊者？
      con3=>condition: 有防禦卡？
      con4=>condition: 使用？
      op=>operation: 將使用的卡片資訊送給後端
      op1=>operation: 往後端發送攻擊成功，自己的防禦卡不更動
      op2=>operation: 往後端發送攻擊失敗，自己的防禦卡-1
      op3=>operation: 即時更新狀況
      op4=>operation: 往後端發送攻擊成功。
      e=>end: 結束
      con1(yes)->op->e
      con1(no)->con2
      con2(yes)->con3
      con2(no)->op3->e
      con3(yes)->con4
      con3(no)->op4->e
      con4(yes)->op2
      con4(no)->op1->e
      ```



    * 後端

      ```flow
      st=>start: 接收前端訊號
      con1=>condition: 是攻擊卡?
      con2=>condition: 攻擊對象是否有防禦卡
      con3=>condition: 使用防禦卡？
      e1=>end: 戰鬥成功，往 firebase 將對象血量 -1，更新戰況給所有玩家
      e2=>end: 戰鬥失敗，往 firebase 將對象防禦卡 -1，更新戰況給所有玩家
      e3=>end: 戰鬥失敗，往 firebase 將該使用者防禦卡 -1，更新戰況給所有玩家
      st->con1
      con1(yes)->con2
      con1(no)->e3
      con2(yes)->con3
      con2(no)->e1
      con3(yes)->e2
      con3(no)->e1
      ```



12. ### 已死亡

    * 前端

    ```flow
    st=>start: 檢測到自己的血量已歸零
    con1=>condition: 是否離開房間
    e1=>end: 發送個人資訊到後端，並且回到房間清單
    e2=>end: 回合自動被跳過，可觀戰

    st->con1
    con1(yes)->e1
    con1(no)->e2
    ```

    * 後端

      ``` flow
      st=>start:
      con1=>condition: 是否離開房間
      e1=>end: 接收使用者個人資訊，往 firebase 內該房間之資訊移除使用者。
      e2=>end: 回合自動被跳過，仍往該使用者持續推送戰況
      con1(yes)->e1
      con1(no)->e2
      ```



13. ### 遊戲結束

    * 前端

      ```flow
      st=>start: 檢測到勝負已分
      e1=>end: 該房內所有玩家返回至房間畫面，遊戲結束。

      st->e1
      ```



    * 後端

      ```flow
      st=>start: 檢測到勝負已分
      end=>operation: 往前端推送已結束之訊號，使其路由回到房間。

      st->end
      ```



14. ### 遊戲內聊天



