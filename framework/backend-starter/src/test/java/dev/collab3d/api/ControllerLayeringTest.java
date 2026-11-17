package dev.collab3d.api;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static org.assertj.core.api.Assertions.assertThat;

import dev.collab3d.ws.SessionSocketHandler;
import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The inbound adapters are HTTP and WebSocket shells: adapter -> service -> repository. A
 * repository dependency here would let an adapter skip the service layer and take over rules that
 * belong to it, so the rule is locked in by an executable test instead of relying on review.
 *
 * <p>It used to be a reflection check over the controller fields (it would have missed a
 * repository used inside a method body, or the WebSocket handler). ArchUnit sees every
 * dependency of the compiled classes, and the same pattern is reused in the framework phase with
 * the {@code ..api..}/{@code ..ws..} packages.
 */
class ControllerLayeringTest {

    /** Everything in the application, without the test classes (they live in the same packages). */
    private static JavaClasses classes;

    @BeforeAll
    static void importClasses() {
        classes = new ClassFileImporter()
                .withImportOption(new ImportOption.DoNotIncludeTests())
                .importPackages("dev.collab3d");
    }

    @Test
    void httpAndWebSocketAdaptersDoNotDependOnRepositories() {
        noClasses()
                .that().resideInAnyPackage("..api..", "..ws..")
                .should().dependOnClassesThat().resideInAPackage("..repository..")
                .because("the adapters talk to services; persistence belongs to the service layer")
                .check(classes);
    }

    /**
     * Guards the rule above against a silent no-op: if the import ever stops seeing the adapter
     * packages (a rename, a packaging change), the layering rule would pass for the wrong reason.
     */
    @Test
    void theRuleActuallySeesTheAdapterPackages() {
        List<String> names = new ArrayList<>();
        for (JavaClass javaClass : classes) {
            names.add(javaClass.getName());
        }

        assertThat(names).contains(
                UserController.class.getName(),
                SessionController.class.getName(),
                AuthController.class.getName(),
                SessionSocketHandler.class.getName());
        assertThat(names).contains("dev.collab3d.repository.UserRepository");
    }
}
