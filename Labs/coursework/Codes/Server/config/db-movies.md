# Документация по работе с таблицей movies

## Основные команды

1. **Добавление уникального индекса**

```sql
CREATE UNIQUE INDEX movies_position_unique 
ON movies (position) 
WHERE position > 0;
```