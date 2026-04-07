package com.okayji;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class OkayjiApplication {
    public static void main(String[] args) {
        SpringApplication.run(OkayjiApplication.class, args);
    }
}
