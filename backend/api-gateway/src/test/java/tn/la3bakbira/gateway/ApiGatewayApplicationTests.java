package tn.la3bakbira.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// Eureka client disabled so the test does not need a running discovery-server
@SpringBootTest(properties = "eureka.client.enabled=false")
class ApiGatewayApplicationTests {

    @Test
    void contextLoads() {
    }
}
