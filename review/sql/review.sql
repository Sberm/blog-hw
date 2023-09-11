CREATE TABLE review (
	id serial PRIMARY KEY,
	title VARCHAR (200) ,
	rating float4,
    -- must have DEFAULT
	review_date DATE NOT NULL DEFAULT CURRENT_DATE,
    review_text VARCHAR(1000),
    restaurant_name VARCHAR(100);
);