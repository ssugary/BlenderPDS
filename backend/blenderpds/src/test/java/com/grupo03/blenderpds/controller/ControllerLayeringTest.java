package com.grupo03.blenderpds.controller;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * The controllers are HTTP adapters: controller -> service -> repository. A repository
 * field here would let a controller skip the service layer and take over rules that
 * belong to it, so the rule is locked in by this test instead of relying on review.
 *
 * <p>{@code AuthController} used to hold a {@code SecurityContextRepository} of its own;
 * this test would have failed then and is the regression guard for it coming back.
 */
class ControllerLayeringTest {

    private static final List<Class<?>> CONTROLLERS = List.of(
            UserController.class,
            AuthController.class,
            SessionController.class);

    @Test
    void controllersDoNotDependOnRepositories() {
        List<String> offenders = new ArrayList<>();
        for (Class<?> controller : CONTROLLERS) {
            for (Field field : controller.getDeclaredFields()) {
                if (Modifier.isStatic(field.getModifiers())) {
                    continue;
                }
                if (field.getType().getSimpleName().endsWith("Repository")) {
                    offenders.add(controller.getSimpleName() + "." + field.getName()
                            + " (" + field.getType().getName() + ")");
                }
            }
        }

        assertThat(offenders)
                .as("controller -> service -> repository")
                .isEmpty();
    }
}
