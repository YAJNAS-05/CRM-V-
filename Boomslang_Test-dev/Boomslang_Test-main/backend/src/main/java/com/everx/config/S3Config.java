package com.everx.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import org.springframework.context.annotation.Bean;

import java.net.URI;

@Configuration
@ConfigurationProperties(prefix = "everx.s3")
@Data
public class S3Config {
    private String bucket;
    private String endpoint;
    private String region;
    private String accessKey;
    private String secretKey;
    private Boolean usePathStyleAccess;

    @Bean
    public S3Client s3Client() {
        S3ClientBuilder builder = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ));

        if (endpoint != null && !endpoint.isEmpty()) {
            builder.endpointOverride(URI.create(endpoint));
        }

        if (usePathStyleAccess != null && usePathStyleAccess) {
            builder.forcePathStyle(true);
        }

        return builder.build();
    }
}
