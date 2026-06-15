# ER Диаграмма — Система учёта «Лимонад»

На основе анализа технического задания создана следующая схема базы данных.

---

## Общая схема (Mermaid)

```mermaid
erDiagram
    %% =============================================
    %% МОДУЛЬ: Филиалы и структура
    %% =============================================

    Branch {
        int id PK
        string name "Название филиала"
        string code "Код (DSH, HDZ)"
        string city "Город"
        string address "Адрес"
        string phone "Телефон"
        int manager_id FK "Ответственный"
        enum status "active/closed"
        datetime created_at
        datetime updated_at
    }

    %% =============================================
    %% МОДУЛЬ: Пользователи и роли
    %% =============================================

    User {
        int id PK
        string login "Логин"
        string password_hash "Хэш пароля (bcrypt)"
        enum role "director/accountant/manager/storekeeper"
        enum scope "all_branches/own_branches"
        bool is_blocked "Заблокирован"
        int failed_attempts "Неудачные попытки входа"
        datetime last_login
        datetime created_at
    }

    UserBranch {
        int id PK
        int user_id FK
        int branch_id FK
    }

    %% =============================================
    %% МОДУЛЬ: Валюты и курсы
    %% =============================================

    ExchangeRate {
        int id PK
        date rate_date "Дата курса"
        enum currency_pair "USD/TJS"
        decimal rate "Курс (18,4)"
        enum source "manual/nbt"
        int set_by_user_id FK
        datetime created_at
    }

    %% =============================================
    %% МОДУЛЬ: Справочник ингредиентов
    %% =============================================

    Ingredient {
        int id PK
        string name "Название"
        enum category "raw/packaging/other"
        string subcategory "Подкатегория"
        enum base_unit "kg/l/pcs"
        string purchase_unit "Приходная ед. (мешок)"
        decimal conversion_rate "Коэфф. пересчёта"
        decimal min_stock "Минимальный остаток"
        int shelf_life_days "Срок годности (дни)"
        enum status "active/archived"
        datetime created_at
    }

    %% =============================================
    %% МОДУЛЬ: Рецептуры
    %% =============================================

    Recipe {
        int id PK
        string name "Название продукта"
        text description "Описание"
        decimal batch_volume "Объём партии (л)"
        int bottle_output "Выход бутылок"
        decimal bottle_volume "Объём бутылки (л)"
        int shelf_life_days "Срок хранения (дни)"
        enum status "active/archived"
        int current_version_id FK
        datetime created_at
    }

    RecipeVersion {
        int id PK
        int recipe_id FK
        int version_number "Номер версии"
        int author_id FK
        text change_comment "Комментарий к изменению"
        datetime created_at
    }

    RecipeIngredient {
        int id PK
        int recipe_version_id FK
        int ingredient_id FK
        decimal quantity "Количество"
        enum unit "kg/g/l/ml/pcs"
    }

    RecipePackaging {
        int id PK
        int recipe_version_id FK
        int material_id FK "Ссылка на Ingredient (тара)"
        decimal quantity "Количество на партию"
    }

    %% =============================================
    %% МОДУЛЬ: Производство
    %% =============================================

    ProductionBatch {
        int id PK
        string batch_number "П-КОД-YYYYMMDD-NNN"
        int branch_id FK
        int recipe_id FK
        int recipe_version_id FK
        date production_date "Дата производства"
        date expiry_date "Срок годности"
        decimal planned_volume "Запланированный объём"
        int actual_output "Фактический выход (бутылок)"
        int defects "Брак (бутылок)"
        decimal tech_losses "Технологические потери (л)"
        enum status "planned/in_progress/completed/cancelled"
        decimal exchange_rate "Курс USD/TJS"
        decimal cost_usd "Себестоимость (USD)"
        decimal cost_tjs "Себестоимость (TJS)"
        int responsible_id FK "Ответственный сотрудник"
        text comment
        datetime created_at
    }

    %% =============================================
    %% МОДУЛЬ: Склад сырья
    %% =============================================

    IngredientStock {
        int id PK
        int branch_id FK
        int ingredient_id FK
        decimal quantity "Текущий остаток"
        decimal avg_price_usd "Средневзвеш. цена (USD)"
        datetime updated_at
    }

    IngredientReceipt {
        int id PK
        string receipt_number "ПС-КОД-YYYYMMDD-NNN"
        int branch_id FK
        date receipt_date
        int ingredient_id FK
        decimal quantity "Количество"
        decimal price_usd "Цена за ед. (USD)"
        decimal total_usd "Сумма (USD)"
        decimal exchange_rate "Курс USD/TJS"
        decimal total_tjs "Сумма (TJS)"
        string supplier "Поставщик"
        string invoice_number "Номер накладной"
        text comment
        int created_by_id FK
        datetime created_at
    }

    IngredientWriteOff {
        int id PK
        int branch_id FK
        date writeoff_date
        int ingredient_id FK
        decimal quantity
        enum reason "production/spoilage/inventory/other"
        int production_batch_id FK "nullable"
        text comment
        int created_by_id FK
        datetime created_at
    }

    IngredientMovement {
        int id PK
        date movement_date
        int ingredient_id FK
        int branch_id FK
        enum operation_type "receipt/production/spoilage/adjustment/return/transfer_out/transfer_in"
        decimal quantity "Положит. приход, отриц. расход"
        decimal balance_after "Остаток после операции"
        decimal avg_price_after_usd "Средняя цена после (USD)"
        string document_type "receipt/batch/inventory/transfer"
        int document_id "ID связанного документа"
        int user_id FK
        datetime created_at
    }

    Inventory {
        int id PK
        int branch_id FK
        date inventory_date
        enum status "open/completed"
        int conducted_by_id FK
        text comment
        datetime created_at
        datetime completed_at
    }

    InventoryItem {
        int id PK
        int inventory_id FK
        int ingredient_id FK
        decimal system_balance "Системный остаток"
        decimal actual_balance "Фактический остаток"
        decimal difference "Разница (авто)"
        text comment
    }

    %% =============================================
    %% МОДУЛЬ: Склад готовой продукции
    %% =============================================

    ProductStock {
        int id PK
        int branch_id FK
        int recipe_id FK
        int production_batch_id FK
        date production_date
        date expiry_date
        int quantity "Количество (бутылок)"
        decimal unit_cost_usd "Себестоимость ед. (USD)"
        decimal unit_cost_tjs "Себестоимость ед. (TJS)"
        decimal exchange_rate "Курс"
        datetime updated_at
    }

    ProductMovement {
        int id PK
        date movement_date
        int branch_id FK
        int recipe_id FK
        int production_batch_id FK
        enum operation_type "production/sale/spoilage/return/transfer_out/transfer_in/adjustment"
        int quantity "Положит. приход, отриц. расход"
        int balance_after "Остаток после"
        string document_type
        int document_id
        int user_id FK
        datetime created_at
    }

    %% =============================================
    %% МОДУЛЬ: Межфилиальные трансферы
    %% =============================================

    Transfer {
        int id PK
        string transfer_number "ТР-КОД-YYYYMMDD-NNN"
        date created_date
        int sender_branch_id FK
        int receiver_branch_id FK
        enum transfer_type "raw_materials/finished_products"
        enum status "created/in_transit/received/cancelled"
        date sent_date
        date received_date
        int sent_by_id FK
        int received_by_id FK
        text comment
        datetime created_at
    }

    TransferItem {
        int id PK
        int transfer_id FK
        int item_id "ID ингредиента или продукта"
        enum item_type "ingredient/product"
        decimal quantity_sent "Отправлено"
        decimal quantity_received "Получено"
        decimal discrepancy "Расхождение (авто)"
        decimal transfer_price_usd "Цена передачи (USD)"
    }

    %% =============================================
    %% МОДУЛЬ: Клиенты
    %% =============================================

    Client {
        int id PK
        enum client_type "legal/individual"
        string name "Название/ФИО"
        string contact_person "Контактное лицо"
        string phone
        string email
        string address
        string tax_id "ИНН"
        int price_list_id FK
        decimal credit_limit_tjs "Кредитный лимит (TJS)"
        text comment
        enum status "active/archived"
        datetime created_at
    }

    %% =============================================
    %% МОДУЛЬ: Прайс-листы
    %% =============================================

    PriceList {
        int id PK
        int branch_id FK "nullable - общий прайс"
        string name "Базовый/Оптовый/VIP"
        text description
        enum list_type "base/special"
        datetime created_at
    }

    PriceListItem {
        int id PK
        int price_list_id FK
        int recipe_id FK
        decimal price_tjs "Цена за бутылку (TJS)"
        int min_order_quantity "Мин. объём заказа"
        datetime updated_at
    }

    %% =============================================
    %% МОДУЛЬ: Продажи
    %% =============================================

    Sale {
        int id PK
        string sale_number "ПР-КОД-YYYYMMDD-NNN"
        int branch_id FK
        date sale_date
        int client_id FK
        enum status "draft/confirmed/shipped/paid/partially_paid"
        enum payment_method "cash/bank_transfer"
        enum payment_status "unpaid/partial/paid"
        decimal total_tjs "Сумма (TJS)"
        decimal paid_tjs "Оплачено (TJS)"
        decimal debt_tjs "Долг (TJS)"
        date payment_due_date "Срок оплаты"
        text comment
        int created_by_id FK
        datetime created_at
    }

    SaleItem {
        int id PK
        int sale_id FK
        int recipe_id FK
        int quantity "Количество (бутылок)"
        decimal unit_price_tjs "Цена за ед. (TJS)"
        decimal total_tjs "Сумма (TJS)"
        decimal unit_cost_usd "Себестоимость ед. (USD)"
        decimal unit_cost_tjs "Себестоимость ед. (TJS)"
        decimal exchange_rate "Курс на дату продажи"
    }

    Payment {
        int id PK
        int sale_id FK
        date payment_date
        decimal amount_tjs "Сумма (TJS)"
        enum method "cash/bank_transfer"
        text comment
        int created_by_id FK
        datetime created_at
    }

    %% =============================================
    %% МОДУЛЬ: Возвраты
    %% =============================================

    SaleReturn {
        int id PK
        string return_number "ВЗ-КОД-YYYYMMDD-NNN"
        int branch_id FK
        date return_date
        int sale_id FK
        int client_id FK
        enum reason "defect/wrong_product/expired/other"
        text comment
        int created_by_id FK
        datetime created_at
    }

    SaleReturnItem {
        int id PK
        int return_id FK
        int recipe_id FK
        int quantity
        bool return_to_stock "Годен для продажи"
    }

    %% =============================================
    %% МОДУЛЬ: Расходы
    %% =============================================

    ExpenseCategory {
        int id PK
        string name "Название статьи"
        text description
        bool is_system "Системная (не удаляемая)"
        datetime created_at
    }

    Expense {
        int id PK
        int branch_id FK "nullable - общий расход"
        date expense_date
        int category_id FK
        enum currency "USD/TJS"
        decimal amount_original "Сумма в оригинальной валюте"
        decimal exchange_rate "Курс (для USD)"
        decimal amount_tjs "Сумма (TJS)"
        text comment
        bool is_recurring "Повторяющийся"
        enum recurrence_period "monthly/weekly"
        enum source "manual/auto_receipt/auto_payroll"
        int source_document_id "ID связанного документа"
        int created_by_id FK
        datetime created_at
    }

    RecurringExpenseTemplate {
        int id PK
        int branch_id FK
        int category_id FK
        string name "Название шаблона"
        decimal amount_tjs
        int day_of_month "День месяца"
        bool is_active
        datetime created_at
    }

    %% =============================================
    %% МОДУЛЬ: Сотрудники
    %% =============================================

    Employee {
        int id PK
        int branch_id FK "nullable - управление"
        string full_name "ФИО"
        string position "Должность"
        enum payment_type "salary/hourly/piecework"
        decimal rate_tjs "Ставка (TJS)"
        date hire_date "Дата приёма"
        date termination_date "Дата увольнения"
        enum status "active/terminated"
        int user_id FK "nullable - если пользователь системы"
        datetime created_at
    }

    EmployeeRateHistory {
        int id PK
        int employee_id FK
        decimal old_rate_tjs
        decimal new_rate_tjs
        string old_position
        string new_position
        date change_date
        text reason
    }

    %% =============================================
    %% МОДУЛЬ: Учёт рабочего времени
    %% =============================================

    Timesheet {
        int id PK
        int employee_id FK
        date work_date
        enum day_type "work/day_off/sick/vacation/absent"
        decimal hours "Часы (для рабочего дня)"
        text comment
        int created_by_id FK
        datetime created_at
    }

    %% =============================================
    %% МОДУЛЬ: Зарплата
    %% =============================================

    PayrollCalculation {
        int id PK
        int branch_id FK "nullable - управление"
        date period_month "Месяц расчёта"
        enum status "draft/approved/paid"
        date approved_date
        int approved_by_id FK
        datetime created_at
    }

    PayrollItem {
        int id PK
        int calculation_id FK
        int employee_id FK
        decimal days_worked "Отработано дней"
        decimal hours_worked "Отработано часов"
        int units_produced "Произведено единиц (сдельная)"
        decimal base_amount_tjs "Базовая сумма"
        decimal bonuses_tjs "Премии"
        decimal penalties_tjs "Штрафы"
        decimal advances_tjs "Авансы"
        decimal total_tjs "Итого к выплате"
    }

    Bonus {
        int id PK
        int employee_id FK
        enum bonus_type "bonus/penalty"
        decimal amount_tjs
        date bonus_date
        text reason
        date period_month "К какому месяцу"
        int created_by_id FK
        datetime created_at
    }

    Advance {
        int id PK
        int employee_id FK
        date issue_date
        decimal amount_tjs
        date period_month "Из какого месяца вычитается"
        int created_by_id FK
        datetime created_at
    }

    %% =============================================
    %% МОДУЛЬ: Аудит и уведомления
    %% =============================================

    AuditLog {
        int id PK
        int user_id FK
        datetime action_time
        string entity_type "Тип сущности"
        int entity_id "ID сущности"
        enum action "create/update/delete"
        int branch_id FK
        json old_value "Старое значение"
        json new_value "Новое значение"
    }

    Notification {
        int id PK
        int user_id FK
        string title
        text message
        enum notification_type "info/warning/critical"
        string link_entity "Тип связанной сущности"
        int link_id "ID связанной сущности"
        bool is_read
        datetime created_at
        datetime read_at
    }

    %% =============================================
    %% СВЯЗИ
    %% =============================================

    %% Филиалы и пользователи
    User ||--o{ UserBranch : "имеет доступ"
    Branch ||--o{ UserBranch : "доступен для"
    Branch ||--o| User : "ответственный"

    %% Курсы
    User ||--o{ ExchangeRate : "устанавливает"

    %% Рецептуры
    Recipe ||--o{ RecipeVersion : "имеет версии"
    Recipe ||--o| RecipeVersion : "текущая версия"
    RecipeVersion ||--o{ RecipeIngredient : "содержит"
    RecipeVersion ||--o{ RecipePackaging : "содержит тару"
    RecipeIngredient }o--|| Ingredient : "ингредиент"
    RecipePackaging }o--|| Ingredient : "материал (тара)"
    User ||--o{ RecipeVersion : "автор"

    %% Производство
    ProductionBatch }o--|| Branch : "филиал"
    ProductionBatch }o--|| Recipe : "рецептура"
    ProductionBatch }o--|| RecipeVersion : "версия"
    ProductionBatch }o--o| Employee : "ответственный"

    %% Склад сырья
    IngredientStock }o--|| Branch : "филиал"
    IngredientStock }o--|| Ingredient : "ингредиент"
    IngredientReceipt }o--|| Branch : "филиал"
    IngredientReceipt }o--|| Ingredient : "ингредиент"
    IngredientReceipt }o--|| User : "создал"
    IngredientWriteOff }o--|| Branch : "филиал"
    IngredientWriteOff }o--|| Ingredient : "ингредиент"
    IngredientWriteOff }o--o| ProductionBatch : "партия"
    IngredientMovement }o--|| Branch : "филиал"
    IngredientMovement }o--|| Ingredient : "ингредиент"
    IngredientMovement }o--|| User : "пользователь"

    %% Инвентаризация
    Inventory }o--|| Branch : "филиал"
    Inventory }o--|| User : "провёл"
    Inventory ||--o{ InventoryItem : "позиции"
    InventoryItem }o--|| Ingredient : "ингредиент"

    %% Склад готовой продукции
    ProductStock }o--|| Branch : "филиал"
    ProductStock }o--|| Recipe : "продукт"
    ProductStock }o--|| ProductionBatch : "партия"
    ProductMovement }o--|| Branch : "филиал"
    ProductMovement }o--|| Recipe : "продукт"
    ProductMovement }o--|| User : "пользователь"

    %% Трансферы
    Transfer }o--|| Branch : "отправитель"
    Transfer }o--|| Branch : "получатель"
    Transfer }o--|| User : "отправил"
    Transfer }o--o| User : "принял"
    Transfer ||--o{ TransferItem : "позиции"

    %% Клиенты и прайсы
    Client }o--o| PriceList : "прайс-лист"
    PriceList }o--o| Branch : "филиал"
    PriceList ||--o{ PriceListItem : "позиции"
    PriceListItem }o--|| Recipe : "продукт"

    %% Продажи
    Sale }o--|| Branch : "филиал"
    Sale }o--|| Client : "клиент"
    Sale }o--|| User : "создал"
    Sale ||--o{ SaleItem : "позиции"
    Sale ||--o{ Payment : "платежи"
    SaleItem }o--|| Recipe : "продукт"
    Payment }o--|| User : "создал"

    %% Возвраты
    SaleReturn }o--|| Branch : "филиал"
    SaleReturn }o--|| Sale : "продажа"
    SaleReturn }o--|| Client : "клиент"
    SaleReturn ||--o{ SaleReturnItem : "позиции"
    SaleReturnItem }o--|| Recipe : "продукт"

    %% Расходы
    Expense }o--o| Branch : "филиал"
    Expense }o--|| ExpenseCategory : "статья"
    Expense }o--|| User : "создал"
    RecurringExpenseTemplate }o--o| Branch : "филиал"
    RecurringExpenseTemplate }o--|| ExpenseCategory : "статья"

    %% Сотрудники
    Employee }o--o| Branch : "филиал"
    Employee }o--o| User : "учётная запись"
    Employee ||--o{ EmployeeRateHistory : "история ставок"
    Employee ||--o{ Timesheet : "табель"
    Employee ||--o{ Bonus : "премии/штрафы"
    Employee ||--o{ Advance : "авансы"
    Timesheet }o--|| User : "создал"
    Bonus }o--|| User : "создал"
    Advance }o--|| User : "создал"

    %% Зарплата
    PayrollCalculation }o--o| Branch : "филиал"
    PayrollCalculation }o--o| User : "утвердил"
    PayrollCalculation ||--o{ PayrollItem : "позиции"
    PayrollItem }o--|| Employee : "сотрудник"

    %% Аудит и уведомления
    AuditLog }o--|| User : "пользователь"
    AuditLog }o--o| Branch : "филиал"
    Notification }o--|| User : "получатель"
```

---

## Сводная таблица сущностей

| Модуль | Сущности | Описание |
|--------|----------|----------|
| **Филиалы** | Branch, UserBranch | Филиалы и привязка пользователей |
| **Пользователи** | User | Аутентификация, роли |
| **Валюты** | ExchangeRate | Курсы USD/TJS |
| **Справочники** | Ingredient, ExpenseCategory | Ингредиенты, статьи расходов |
| **Рецептуры** | Recipe, RecipeVersion, RecipeIngredient, RecipePackaging | Рецепты с версионированием |
| **Производство** | ProductionBatch | Производственные партии |
| **Склад сырья** | IngredientStock, IngredientReceipt, IngredientWriteOff, IngredientMovement, Inventory, InventoryItem | Учёт сырья |
| **Склад ГП** | ProductStock, ProductMovement | Готовая продукция |
| **Трансферы** | Transfer, TransferItem | Межфилиальные перемещения |
| **Клиенты** | Client | Справочник клиентов |
| **Прайсы** | PriceList, PriceListItem | Прайс-листы по филиалам |
| **Продажи** | Sale, SaleItem, Payment | Учёт продаж и платежей |
| **Возвраты** | SaleReturn, SaleReturnItem | Возвраты от клиентов |
| **Расходы** | Expense, RecurringExpenseTemplate | Учёт расходов |
| **Сотрудники** | Employee, EmployeeRateHistory | Кадровый учёт |
| **Табель** | Timesheet | Учёт рабочего времени |
| **Зарплата** | PayrollCalculation, PayrollItem, Bonus, Advance | Расчёт зарплаты |
| **Система** | AuditLog, Notification | Аудит и уведомления |

---

## Ключевые связи

### Иерархия филиалов
- Все операционные данные (склад, производство, продажи) привязаны к **Branch**
- Справочники (Ingredient, Recipe, Client, ExchangeRate) — **общие** для всех филиалов
- PriceList может быть общим (branch_id = NULL) или привязан к филиалу

### Версионирование рецептур
```
Recipe 1──* RecipeVersion 1──* RecipeIngredient
                           1──* RecipePackaging
```
- При изменении состава создаётся новая RecipeVersion
- ProductionBatch ссылается на конкретную RecipeVersion

### Движения склада
- Все операции (приход, списание, трансфер) создают записи в IngredientMovement / ProductMovement
- IngredientStock / ProductStock — текущий snapshot остатков

### Мультивалютность
- Сырьё: цены в **USD**, средневзвешенная в USD
- Продажи, расходы, зарплата: **TJS**
- При производстве/продаже фиксируется курс ExchangeRate на дату операции

---

## Индексы (рекомендации)

```sql
-- Частые фильтры по филиалу
CREATE INDEX idx_ingredient_stock_branch ON ingredient_stock(branch_id);
CREATE INDEX idx_production_batch_branch ON production_batch(branch_id);
CREATE INDEX idx_sale_branch_date ON sale(branch_id, sale_date);
CREATE INDEX idx_expense_branch_date ON expense(branch_id, expense_date);

-- Движения склада
CREATE INDEX idx_ingredient_movement_date ON ingredient_movement(movement_date);
CREATE INDEX idx_ingredient_movement_ingredient ON ingredient_movement(ingredient_id);

-- Аудит
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);

-- Уведомления
CREATE INDEX idx_notification_user_read ON notification(user_id, is_read);
```

---

## Примечания

1. **Soft Delete**: Все финансовые сущности (Sale, Expense, PayrollCalculation) используют soft delete через поле `deleted_at`
2. **Автогенерация номеров**: Номера документов генерируются по шаблону `ТИП-КОД_ФИЛИАЛА-YYYYMMDD-NNN`
3. **Часовой пояс**: Все datetime хранятся в UTC+5 (Asia/Dushanbe)
4. **Decimal precision**: Денежные суммы — DECIMAL(18,2), курсы — DECIMAL(18,4)
