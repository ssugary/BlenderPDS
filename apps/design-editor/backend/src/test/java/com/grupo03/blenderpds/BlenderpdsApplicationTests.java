package com.grupo03.blenderpds;

import static org.assertj.core.api.Assertions.assertThat;

import dev.collab3d.ws.OperationKindRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * The Phase 1 gate from the application side: the editor boots on top of the starter's
 * auto-configuration and its own {@code kinds} package is what fills the operation-kind
 * registry. If the framework ever needed a domain kind to start, or the app stopped
 * contributing its five, the context would come up wrong and this test would fail.
 */
@SpringBootTest(properties = {
        // the app's main properties point at the repo-root compose.yaml; docker-compose is
        // skipped in tests by default, and this test wants the real Postgres
        "spring.docker.compose.skip.in-tests=false",
        "spring.docker.compose.file=../../../compose.yaml"
})
class BlenderpdsApplicationTests {

    @Autowired
    private OperationKindRegistry operationKinds;

    @Test
    void contextLoadsWithTheEditorOperationKinds() {
        assertThat(operationKinds.kinds())
                .containsExactly("add_object", "change_color", "remove_object", "set_mesh", "set_transform");
    }
}
