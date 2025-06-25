CREATE TABLE IF NOT EXISTS filemeta (
                                        dirhash     BIGINT,
                                        name        VARCHAR(65535),
    directory   VARCHAR(65535),
    meta        bytea,
    PRIMARY KEY (dirhash, name)
    );
