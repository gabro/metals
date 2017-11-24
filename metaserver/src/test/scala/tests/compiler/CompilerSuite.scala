package tests.compiler

import scala.meta.languageserver.Compiler
import scala.reflect.internal.util.Position
import scala.tools.nsc.interactive.Global
import tests.MegaSuite

class CompilerSuite(implicit file: sourcecode.File) extends MegaSuite {
  val compiler: Global =
    Compiler.newCompiler(classpath = "", scalacOptions = Nil)

  private def computeChevronPositionFromMarkup(
      filename: String,
      markup: String
  ): List[Position] = {
    val chevrons = "<<(.*?)>>".r
    val carets0 =
      chevrons.findAllIn(markup).matchData.map(m => (m.start, m.end)).toList
    val carets = carets0.zipWithIndex.map {
      case ((s, e), i) => (s - 4 * i, e - 4 * i - 4)
    }
    val code = chevrons.replaceAllIn(markup, "$1")
    val unit = Compiler.addCompilationUnit(compiler, code, filename)
    carets.map {
      case (start, end) =>
        unit.position(start)
    }
  }

  /**
   * Utility to test the presentation compiler with a position.
   *
   * Use it like like this:
   * {{{
   *   targeted(
   *     "apply",
   *     "object Main { Lis<<t>>", { arg =>
   *       assert(compiler.typeCompletionsAt(arg) == "List" :: Nil)
   *     }
   *   )
   * }}}
   * The `<<t>>` chevron indicates the callback position.
   *
   * See SignatureHelpTest for more inspiration on how to abstract further on
   * top of this method.
   */
  def targeted(filename: String, markup: String, fn: Position => Unit): Unit = {
    test(filename) {
      val positions =
        computeChevronPositionFromMarkup(filename + ".scala", markup)
      positions match {
        case List(pos) => fn(pos)
        case _ =>
          sys.error(s"1 chevron expected, ${positions.length} chevrons found")
      }
    }
  }

}