CREATE TABLE review_img (
    img_id serial PRIMARY KEY,
    id integer REFERENCES review (id),
    img VARCHAR(2083)
);